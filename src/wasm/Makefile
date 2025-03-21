
all: tama.wasm

tama_rom.h:
	python3 convert.py

tama.wasm: tama_rom.h
	emcc -Oz tama.c $(wildcard ../tamalib/*.c) -o tama.wasm

clean:
	rm tama_rom.h
	rm tama.wasm