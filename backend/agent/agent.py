from typing import Annotated, Sequence, TypedDict, Union
from langgraph.graph import StateGraph
from typing_extensions import TypedDict
import json
import operator
import asyncio
from prompts import PROMPTS
from step_functions import FUNCTIONS
from step_ids import StepID
from agent_graph import STEPS, DEPENDENCIES, StepType
from llm_client import LLMClient
import inspect
import pprint


class AnalysisState(TypedDict):
    messages: Annotated[Sequence[str], operator.add]  # Append-only list
    step_outputs: Annotated[dict, operator.or_]  # Stores all step results



class Publisher:
    def __init__(self):
        self.subscribers = []
        self.loop = asyncio.get_event_loop()

    def subscribe(self, subscriber):
        self.subscribers.append(subscriber)

    def publish(self, message):
        for subscriber in self.subscribers:
            asyncio.run_coroutine_threadsafe(subscriber.receive(message), self.loop)


class GapAnalysisAgent:
    def __init__(self):
        self.publisher = Publisher()
        self.llm = LLMClient()
        self.workflow = self.__create_graph()

    def __broadcast_step_execution(func):
        def wrapper(self, state, step):
            self.publisher.publish({"type": "step_executing", "nodeId": step, "output":""})
            try:
                result = func(self, state, step)  # Call original function
                self.publisher.publish({"type": "step_completed", "nodeId": step, "output": result})
                return result
            except Exception as e:
                error_message = f"Error in step {step}: {str(e)}"
                self.publisher.publish({"type": "error", "nodeId": step, "error": error_message})
                raise  # Re-raise the exception after logging
        return wrapper
    
    @__broadcast_step_execution
    def __execute_step_function(self, state, step):
        result = FUNCTIONS[step](state)
        return result


    @__broadcast_step_execution
    def __execute_llm_prompt(self, state: AnalysisState, step: str) -> dict:
        prompt = PROMPTS[step](state)
        try:
            response = self.llm.invoke(prompt)
            if(STEPS[step]["type"] == StepType.LLM_JSON):
                response = json.loads(response)
            return response
        except Exception as e:
            error_msg = f"Error in {step}: {str(e)}"
            return {"messages": [error_msg]}


    def __create_graph(self):
        workflow = StateGraph(AnalysisState)

        step_handlers = {
            StepType.FUNCTION: self.__execute_step_function,
            StepType.LLM_TEXT: self.__execute_llm_prompt,
            StepType.LLM_JSON: self.__execute_llm_prompt
        }

        for step_id, step_info in STEPS.items():
            # workflow.add_node(step_id, lambda state, step=step_id.value, step_type=step_info["type"]: {
            #     **state,
            #     "step_outputs": {**state["step_outputs"], step: step_handlers[step_type](state, step)}
            # })
            workflow.add_node(step_id, lambda state, step=step_id.value, step_type=step_info["type"]: {
                **state,
                "step_outputs": {**state["step_outputs"], step: step_handlers[step_type](state, step)}
            })
            
        for parent, child in DEPENDENCIES:
            workflow.add_edge(parent, child)
        
        workflow.set_entry_point(StepID.ANALYSIS_0)
        workflow.set_finish_point(StepID.SLIDE_4)
        return workflow.compile()
    
    def subscribe(self, subscriber):
        self.publisher.subscribe(subscriber)


    def get_graph_description(self):
        def get_step_description(step_id, step_info):
            if step_info["type"] in {"llm_text", "llm_json"}:
                state_placeholder = {step.value: "<previous_output>" for step in STEPS.keys()}
                return PROMPTS[step_id](state_placeholder).strip()
            elif step_info["type"] == "function":
                function_code = FUNCTIONS[step_id]
                try:
                    source_code = inspect.getsource(function_code)
                except Exception:
                    source_code = "Unable to retrieve function source."
                return f"```\n{source_code.strip()}\n```"  # Now returns human-readable function source code
            return "No description available"

        graph_data = {"nodes": [], "edges": []}

        for step_id, step_info in STEPS.items():
            node = {
                "id": step_id.value,
                "type": step_info["type"].value,
                "label": step_id.value.replace("_", " ").title(),
                "description": get_step_description(step_id, step_info),
            }
            graph_data["nodes"].append(node)

        for source, target in DEPENDENCIES:
            edge = {
                "source": source.value,
                "target": target.value,
            }
            graph_data["edges"].append(edge)

        return graph_data

    
    async def execute(self):
        initial_state = {
            "messages": [],
            "step_outputs": {}
        }
        try:
            def run_workflow():
                generator = self.workflow.stream(initial_state)  # Get the generator
                while True:
                    try:
                        next_state = next(generator)  # 🔥 Triggers execution
                        # pprint.pp(next_state)
                    except StopIteration:
                        break 
            await asyncio.to_thread(run_workflow)

        except Exception as e:
            self.publisher.publish(f"❌ Error during execution: {str(e)}")
            raise

