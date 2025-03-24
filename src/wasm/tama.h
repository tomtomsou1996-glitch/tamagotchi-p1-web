#ifndef _TAMA_H_
#define _TAMA_H_

#include <stddef.h>
#include "hal_types.h"

void tama_wasm_init();
void tama_wasm_step();
void tama_wasm_button(char button, bool_t down);
void tama_wasm_save();
void tama_wasm_load(u32_t *saved_state);
void tama_wasm_set_value(u32_t *saved_state, size_t index, u32_t value);

#endif /* _TAMA_H_ */