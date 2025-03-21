#include <stdio.h>
#include <stdbool.h>
#include <sys/time.h>
#include "../tamalib/tamalib.h"
#include "tama_rom.h"

// Build: emcc hello.c tamalib.c cpu.c hw.c -o hello.html
// Serve:  sudo python3 -m http.server 80
static void * hal_malloc(u32_t size)
{
    printf("hal_malloc\n");
	return NULL;
}

static void hal_free(void *ptr)
{
}

static void hal_halt(void)
{
}

static bool_t hal_is_log_enabled(log_level_t level)
{
	return false;
}

static timestamp_t hal_get_timestamp(void)
{
    struct timeval te; 
    gettimeofday(&te, NULL); // get current time
    long long milliseconds = te.tv_sec*1000LL + te.tv_usec/1000; // calculate milliseconds
	return milliseconds;
}

static void hal_log(log_level_t level, char *buff, ...) {}
static void hal_sleep_until(timestamp_t ts) {}

static void hal_update_screen(void)
{
	printf("hal_update_screen\n");
}

static void hal_set_lcd_matrix(u8_t x, u8_t y, bool_t val) {

}

static void hal_set_lcd_icon(u8_t icon, bool_t val) {
}

static void hal_set_frequency(u32_t freq)
{
}

static void hal_play_frequency(bool_t play)
{
}

static int hal_handler(void)
{
	return 0;
}


static hal_t hal = {
	.malloc = &hal_malloc,
	.free = &hal_free,
	.halt = &hal_halt,
	.is_log_enabled = &hal_is_log_enabled,
	.log = &hal_log,
	.sleep_until = &hal_sleep_until,
	.get_timestamp = &hal_get_timestamp,
	.update_screen = &hal_update_screen,
	.set_lcd_matrix = &hal_set_lcd_matrix,
	.set_lcd_icon = &hal_set_lcd_icon,
	.set_frequency = &hal_set_frequency,
	.play_frequency = &hal_play_frequency,
	.handler = &hal_handler,
};

int main() {
    printf("Hello World\n");

    tamalib_register_hal(&hal);
    tamalib_init((u12_t*)g_program, NULL, 1000);
    tamalib_mainloop();
    tamalib_release();
    return 0;
}