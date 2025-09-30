"""P-Type - The Typing Game entry point."""

from __future__ import annotations

from core.environment import configure_environment


def main() -> None:
    """Configure the runtime environment and launch the game."""
    configure_environment()

    # Import only after configuring the environment so pygame picks up the
    # correct SDL drivers regardless of platform.
    from core.app import PTypeGame

    game = PTypeGame()
    game.run()


if __name__ == "__main__":
    main()

