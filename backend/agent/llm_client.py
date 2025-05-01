from dotenv import load_dotenv
import os
from langchain_openai import ChatOpenAI

load_dotenv()

LLM_MODEL = "gpt-3.5-turbo"
API_KEY = "OPENAI_API_KEY"

class LLMClient:
    def __init__(self, model= LLM_MODEL):
        api_key = os.getenv(API_KEY)
        if not api_key:
            raise ValueError(f'{API_KEY} is missing in environment variables.')
        self.client = ChatOpenAI(model=model, api_key=api_key)

    def invoke(self, prompt):
        try:
            response = self.client.invoke(prompt)
            return response.content  # ✅ Extract text from response
        except Exception as e:
            print(f"LLM Error: {e}")
            return None