from app.events.fast_stream import FastStream
from app.events.routes.incident import router

stream = FastStream()
stream.add_router(router)
stream.start()
