#!python
"""Build a file that's just the release notes for the current version."""

from pathlib import Path

TOP = Path(__file__).parent.parent
CHANGELOG = TOP / "CHANGELOG.md"
NOTES_FILE = TOP / "notes.md"


def main():
    counter = 0
    lines = []
    with open(CHANGELOG, "r") as f:
        while line := f.readline():
            if line[:3] == "## ":
                counter += 1
            if counter >= 2:
                break
            lines.append(line)

    with open(NOTES_FILE, "w") as f:
        f.writelines(lines)

    print(f"Wrote {NOTES_FILE}.")


if __name__ == '__main__':
    main()