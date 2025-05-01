import asyncio
from agent import GapAnalysisAgent

class ConsoleSubscriber:
    async def receive(self, message):
        print(message)

async def main():
    agent = GapAnalysisAgent()
    console_subscriber = ConsoleSubscriber()
    agent.subscribe(console_subscriber)
    await agent.execute()

asyncio.run(main())

# agent = GapAnalysisAgent()
# print(agent.get_graph_description())


