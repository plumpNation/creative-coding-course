# creative-coding-course

Learning to use canvas to be creative, at long last. No react in sight! So far!

## Install dependencies

```sh
make install
```

## Create a new sketch

```sh
make new sketchName
```

## Run existing sketch

There should be a specific make target for all existing sketches, prefixed
with `sketch-`.

```sh
make sketch-lines
```

## Why am I using make instead of package.json scripts directly?

It has tab completion. It is a single location to combine various scripts
into that one location. It can document briefly what these targets do, easily.

Display the Makefile documentation.

```sh
make help
```