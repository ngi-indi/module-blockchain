FROM python:3.8-slim

WORKDIR /usr/src/app

COPY client.py .

RUN pip install requests

CMD ["python", "./client.py"]
