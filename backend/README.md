My environment:
Python 3.12.3


Setup python virtual environment:
mkdir venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt


Test agent without server:
python agent/console_run.py

Start backend server:
python server/websocket_server.py


