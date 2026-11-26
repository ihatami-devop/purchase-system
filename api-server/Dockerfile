FROM python:3.12-slim AS builder

RUN python -m venv /opt/venv

COPY requirements.txt .
RUN /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS runner

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY --exclude=venv --exclude=__pycache__ --exclude=requirements.txt --exclude=Dockerfile . .

EXPOSE 5000


ENTRYPOINT [ "gunicorn" ]
CMD [ "--bind", "0.0.0.0:5000", "app:app" ]