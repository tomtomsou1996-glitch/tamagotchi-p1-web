
all: tama.js

tama_rom.h:
	python3 convert.py

tama.js: tama_rom.h
	emcc \
		-sEXPORTED_FUNCTIONS=_malloc,_free,_tama_wasm_init,_tama_wasm_step,_tama_wasm_button,_tama_wasm_save,_tama_wasm_load,_tama_wasm_set_value \
		-s EXPORT_ES6=1 \
		-sMODULARIZE \
		-s EXPORT_NAME="TamaModule" \
		-s INITIAL_HEAP=65536 \
		-Oz \
		tama.c $(wildcard ../tamalib/*.c) \
		-o tama.js

clean:
	rm -f tama.b
	rm -f tama_rom.h
	rm -f tama.wasm
	rm -f tama.js