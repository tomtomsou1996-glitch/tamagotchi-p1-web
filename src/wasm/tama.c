#include "tama.h"

#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <sys/time.h>
#include <emscripten.h>
#include "../tamalib/tamalib.h"
#include "tama_rom.h"

#define LCD_HEIGHT 16
#define LCD_WIDTH 32
#define JS_BUFFER_SIZE 200

static bool_t matrix_buffer[LCD_HEIGHT][LCD_WIDTH] = {{false}};
static char screen_update_js_buffer[JS_BUFFER_SIZE] = {0};
static char icon_update_js_buffer[JS_BUFFER_SIZE] = {0};

static timestamp_t screen_ts = 0;
static u32_t ts_freq = 10000;
static u8_t g_framerate = 30;

static bool_t button_left_pressed = false;
static bool_t button_middle_pressed = false;
static bool_t button_right_pressed = false;

void matrix_to_bitfield_json()
{
    memset(screen_update_js_buffer, 0, sizeof(screen_update_js_buffer));

    size_t remaining = JS_BUFFER_SIZE - 1; // Leave one byte for the null-terminator
    size_t offset = 0;
    int result;

    result = snprintf(screen_update_js_buffer, remaining, "postMessage([");
    if (result < 0 || result >= remaining)
    {
        printf("Error: JS code buffer not enough for opening part");
        return;
    }

    offset += result;
    remaining -= result;

    for (int i = 0; i < LCD_HEIGHT; i++)
    {
        unsigned int row_bits = 0;

        for (int j = 0; j < LCD_WIDTH; j++)
        {
            if (matrix_buffer[i][j])
            {
                row_bits |= (1 << (LCD_WIDTH - 1 - j));
            }
        }

        result = snprintf(screen_update_js_buffer + offset, remaining, "%u", row_bits);
        if (result < 0 || result >= remaining)
        {
            printf("Error: JS code buffer not enough for numbers");
            break;
        }

        offset += result;
        remaining -= result;

        if (i < LCD_HEIGHT - 1 && remaining > 1)
        {
            screen_update_js_buffer[offset] = ',';
            offset++;
            remaining--;
            screen_update_js_buffer[offset] = '\0'; // Keep null-terminated
        }
        else
        {
            if (remaining == 0)
            {
                printf("Error: JS code buffer not enough for comma");
            }
            break;
        }
    }

    if (remaining >= 3)
    {
        snprintf(screen_update_js_buffer + offset, remaining, "])");
    }
    else
    {
        printf("Error: JS code buffer not enough for close tag\n");
    }
}

static void *hal_malloc(u32_t size)
{
    return NULL;
}

static void hal_free(void *ptr)
{
}

static void hal_halt(void)
{
    printf("CPU halted\n");
}

static bool_t hal_is_log_enabled(log_level_t level)
{
    return false;
}

static timestamp_t hal_get_timestamp(void)
{
    struct timeval te;
    gettimeofday(&te, NULL);
    long long milliseconds = te.tv_sec * 1000LL + te.tv_usec / 1000;
    return milliseconds;
}

static void hal_log(log_level_t level, char *buff, ...)
{
}

static void hal_sleep_until(timestamp_t ts)
{
}

static void hal_update_screen(void)
{
    matrix_to_bitfield_json();
    emscripten_run_script(screen_update_js_buffer);
    emscripten_run_script(icon_update_js_buffer);
}

static void hal_set_lcd_matrix(u8_t x, u8_t y, bool_t val)
{
    matrix_buffer[y][x] = val;
}

static void hal_set_lcd_icon(u8_t icon, bool_t val)
{
    // printf("icon: %d, val: %d\n");
    snprintf(icon_update_js_buffer, 50, "postMessage({\"icon\":%d,\"val\":%d})", icon, val);
}

static void hal_set_frequency(u32_t freq)
{
    // printf("hal_set_frequency");
}

static void hal_play_frequency(bool_t play)
{
    //  printf("hal_play_frequency");
}

static int hal_handler(void)
{
    tamalib_set_button(BTN_LEFT, button_left_pressed ? BTN_STATE_PRESSED : BTN_STATE_RELEASED);
    tamalib_set_button(BTN_MIDDLE, button_middle_pressed ? BTN_STATE_PRESSED : BTN_STATE_RELEASED);
    tamalib_set_button(BTN_RIGHT, button_right_pressed ? BTN_STATE_PRESSED : BTN_STATE_RELEASED);

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

void tama_wasm_init()
{
    printf("Initializing game\n");

    tamalib_register_hal(&hal);
    tamalib_init((u12_t *)g_program, NULL, ts_freq);

    printf("Game initialized\n");
}

void tama_wasm_step()
{
    if (!g_hal->handler())
    {
        tamalib_step();

        timestamp_t ts = g_hal->get_timestamp();
        if (ts - screen_ts >= ts_freq / g_framerate)
        {
            screen_ts = ts;
            g_hal->update_screen();
        }
    }
}

void tama_wasm_button(char button, bool_t down)
{
    // printf("tama_wasm_button : %d %d\n", button, down);

    switch (button)
    {
    case 'A':
        button_left_pressed = down == 1;
        break;
    case 'B':
        button_middle_pressed = down == 1;
        break;
    case 'C':
        button_right_pressed = down == 1;
        break;
    default:
        printf("Unknown button\n");
    }
}