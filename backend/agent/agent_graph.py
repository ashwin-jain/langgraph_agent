from step_ids import *
from prompts import PROMPTS
from step_functions import FUNCTIONS
from enum import Enum

class StepType(str, Enum):  # Use `str` as a base class
    LLM_TEXT = "llm_text"
    LLM_JSON = "llm_json"
    FUNCTION = "function"

STEPS = {
    StepID.ANALYSIS_0: {"type": StepType.FUNCTION},
    StepID.ANALYSIS_1: {"type": StepType.LLM_TEXT},
    StepID.ANALYSIS_2: {"type": StepType.LLM_TEXT},
    StepID.SLIDE_2: {"type": StepType.LLM_JSON},
    StepID.ANALYSIS_3: {"type": StepType.FUNCTION},
    StepID.ANALYSIS_4: {"type": StepType.LLM_TEXT},
    StepID.SLIDE_4: {"type": StepType.LLM_JSON},
}

DEPENDENCIES = [
    (StepID.ANALYSIS_0, StepID.ANALYSIS_1),
    (StepID.ANALYSIS_1, StepID.ANALYSIS_2),
    (StepID.ANALYSIS_2, StepID.SLIDE_2),
    (StepID.ANALYSIS_2, StepID.ANALYSIS_3),
    (StepID.ANALYSIS_3, StepID.ANALYSIS_4),
    (StepID.ANALYSIS_4, StepID.SLIDE_4)
]
