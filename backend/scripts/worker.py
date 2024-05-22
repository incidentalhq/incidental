import typer

from app.services.bg.job_scheduler import BackgroundJobScheduler
from app.utils import setup_logger

setup_logger()
app = typer.Typer(no_args_is_help=True)


@app.command()
def start_bg_scheduler():
    worker = BackgroundJobScheduler()
    worker.start()


if __name__ == "__main__":
    app()
