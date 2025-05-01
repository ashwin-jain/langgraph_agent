import asyncio
import json
import socketio
from aiohttp import web


import sys
import os

agent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../agent"))
sys.path.append(agent_dir)

from agent import GapAnalysisAgent

sio = socketio.AsyncServer(cors_allowed_origins="*")
app = web.Application()
sio.attach(app)

queue = asyncio.Queue()
class SocketIOSubscriber:
    async def receive(self, message):
        await queue.put(json.dumps(message))
subscriber = SocketIOSubscriber()

@sio.event
async def connect(sid, environ):
    print(f"🔗 Client {sid} connected")

@sio.event
async def disconnect(sid):
    print(f"❌ Client {sid} disconnected")

@sio.event
async def start_agent(sid):
    print(f"🚀 Starting agent for client {sid}")

    agent = GapAnalysisAgent()
    agent.subscribe(subscriber)
    agent_task = asyncio.create_task(agent.execute())
    try:
        while not agent_task.done():
            output = await queue.get()
            await sio.emit("message", output, to=sid)
        agent_task.cancel()
        await sio.emit("message", {"type": "agent_completed"}, to=sid)
    except asyncio.CancelledError:
        print("⚠️ Agent execution cancelled.")

# ✅ Add a normal REST API route to return initial data
async def graph_description(request):
    agent = GapAnalysisAgent()
    return web.json_response(agent.get_graph_description(), content_type="application/json")

# Register the REST route in aiohttp
app.router.add_get("/graph-description", graph_description)  # Accessible at http://localhost:8765/graph-description


if __name__ == "__main__":
    web.run_app(app, host="localhost", port=8765)
