#!/bin/bash

set -eu

oftb compile -f anfir -o empty.anfir
oftb compile -f anfir -o hello.anfir std/internal/examples/hello-world
