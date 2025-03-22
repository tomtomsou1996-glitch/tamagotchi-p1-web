
all: tama.js

tama_rom.h:
	python3 convert.py

tama.js: tama_rom.h
	emcc \
		-sEXPORTED_FUNCTIONS=_tama_wasm_init,_tama_wasm_step,_tama_wasm_button \
		-s EXPORT_ES6=1 \
		-sMODULARIZE \
		-s EXPORT_NAME="TamaModule" \
		-Oz \
		tama.c $(wildcard ../tamalib/*.c) \
		-o tama.js

clean:
	rm -f tama_rom.h
	rm -f tama.wasm
	rm -f tama.js