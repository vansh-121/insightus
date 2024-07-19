import os
from dotenv import load_dotenv
load_dotenv()
SECRET_KEY = os.getenv("MY_SECRET")
print(SECRET_KEY)