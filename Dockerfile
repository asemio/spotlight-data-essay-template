FROM asemio/data-container:0.0.1 AS build

COPY data data

ENTRYPOINT [ "/app/app.exe" ]
