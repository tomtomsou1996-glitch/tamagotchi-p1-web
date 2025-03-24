#ifndef _TAMA_H_
#define _TAMA_H_

#include <stddef.h>
#include "hal_types.h"
#include "../tamalib/cpu.h"

// A serializable version of the CPU state
typedef struct
{
  u13_t pc;
  u12_t x;
  u12_t y;
  u4_t a;
  u4_t b;
  u5_t np;
  u8_t sp;
  u4_t flags;

  u32_t tick_counter;
  u32_t clk_timer_2hz_timestamp;
  u32_t clk_timer_4hz_timestamp;
  u32_t clk_timer_8hz_timestamp;
  u32_t clk_timer_16hz_timestamp;
  u32_t clk_timer_32hz_timestamp;
  u32_t clk_timer_64hz_timestamp;
  u32_t clk_timer_128hz_timestamp;
  u32_t clk_timer_256hz_timestamp;
  u32_t prog_timer_timestamp;
  bool_t prog_timer_enabled;
  u8_t prog_timer_data;
  u8_t prog_timer_rld;

  u32_t call_depth;

  interrupt_t interrupts[INT_SLOT_NUM];

  bool_t cpu_halted;

  MEM_BUFFER_TYPE memory[MEM_BUFFER_SIZE];
} cpu_state_t;

cpu_state_t *create_serializable_state();
void restore_from_serializable_state(cpu_state_t *src);

void tama_wasm_init();
void tama_wasm_step();
void tama_wasm_button(char button, bool_t down);
void tama_wasm_save();
void tama_wasm_load(u32_t *saved_state);
void tama_wasm_set_value(u32_t *saved_state, size_t index, u32_t value);

#endif /* _TAMA_H_ */