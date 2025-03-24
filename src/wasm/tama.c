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
#define ICON_COUNT 8
#define JS_BUFFER_SIZE 200

static bool_t matrix_buffer[LCD_HEIGHT][LCD_WIDTH] = {{false}};
static char screen_update_js_buffer[JS_BUFFER_SIZE] = {0};
static bool_t icons[ICON_COUNT] = {false};
static char icon_update_js_buffer[JS_BUFFER_SIZE] = {0};
static char sound_update_js_buffer[JS_BUFFER_SIZE] = {0};

static timestamp_t screen_ts = 0;
static u32_t ts_freq = 1000;
static u8_t g_framerate = 30;

static bool_t button_left_pressed = false;
static bool_t button_middle_pressed = false;
static bool_t button_right_pressed = false;

static float frequency = -1;

void matrix_to_bitfield_json()
{
    memset(screen_update_js_buffer, 0, sizeof(screen_update_js_buffer));

    size_t remaining = JS_BUFFER_SIZE - 1; // Leave one byte for the null-terminator
    size_t offset = 0;
    int result;

    result = snprintf(screen_update_js_buffer, remaining, "postMessage([");
    if (result < 0 || result >= remaining)
    {
        printf("Error: JS code buffer not enough for opening part\n");
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
                printf("Error: JS code buffer not enough for comma\n");
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

void icons_to_json()
{
    const char *prefix = "postMessage([";
    size_t prefix_len = strlen(prefix);
    size_t buffer_size = sizeof(icon_update_js_buffer);

    if (buffer_size <= prefix_len)
    {
        printf("Error: JS code buffer not enough for opening part\n");
        return;
    }

    strncpy(icon_update_js_buffer, prefix, buffer_size - 1);
    icon_update_js_buffer[prefix_len] = '\0';

    size_t remaining_space = buffer_size - prefix_len - 1;
    size_t bufferIndex = prefix_len;

    for (size_t i = 0; i < sizeof(icons) && remaining_space > 3; i++)
    {
        icon_update_js_buffer[bufferIndex++] = icons[i] ? '1' : '0';
        remaining_space--;

        if (i < sizeof(icons) - 1 && remaining_space > 2)
        {
            icon_update_js_buffer[bufferIndex++] = ',';
            remaining_space--;
        }
    }

    if (remaining_space >= 2)
    {
        icon_update_js_buffer[bufferIndex++] = ']';
        icon_update_js_buffer[bufferIndex++] = ')';
        icon_update_js_buffer[bufferIndex] = '\0';
    }
    else
    {
        icon_update_js_buffer[buffer_size - 1] = '\0';
        printf("Error: JS code buffer not enough for icon update code\n");
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
    icons_to_json();
    emscripten_run_script(screen_update_js_buffer);
    emscripten_run_script(icon_update_js_buffer);
    emscripten_run_script(sound_update_js_buffer);
}

static void hal_set_lcd_matrix(u8_t x, u8_t y, bool_t val)
{
    matrix_buffer[y][x] = val;
}

static void hal_set_lcd_icon(u8_t icon, bool_t val)
{
    icons[icon] = val;
}

static void hal_set_frequency(u32_t freq)
{
    frequency = freq / 10;
}

static void hal_play_frequency(bool_t play)
{
    if (play)
    {
        snprintf(sound_update_js_buffer, sizeof(sound_update_js_buffer), "postMessage(%.1f)", frequency);
    }
    else
    {
        snprintf(sound_update_js_buffer, sizeof(sound_update_js_buffer), "postMessage(-1)");
    }
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
    timestamp_t ts;

    if (!g_hal->handler())
    {
        if (cpu_step())
        {
            tamalib_set_exec_mode(EXEC_MODE_PAUSE);
        }

        ts = g_hal->get_timestamp();

        if (ts - screen_ts >= ts_freq / g_framerate)
        {
            screen_ts = ts;
            g_hal->update_screen();
        }
    }
}

void tama_wasm_button(char button, bool_t down)
{
    printf("tama_wasm_button : %d %d\n", button, down);

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
        printf("Unknown button: %c\n", button);
    }
}

void tama_wasm_save()
{
    cpu_state_t *cpu_state = create_serializable_state();
    size_t length = sizeof(cpu_state_t);
    if (cpu_state == NULL)
    {
        return;
    }

    size_t max_size = length * 11 + 3;

    // Allocate memory for the JSON string
    char *json_str = (char *)malloc(max_size);
    if (json_str == NULL)
    {
        free(cpu_state);
        return;
    }

    snprintf(json_str, max_size, "saveToDB([");
    size_t pos = strlen("saveToDB([");

    // Add each integer to the JSON string
    for (size_t i = 0; i < length; i++)
    {
        // Convert the integer to a string and get its length
        int written = snprintf(json_str + pos, max_size - pos, "%u", ((u32_t *)cpu_state)[i]);
        if (written < 0)
        {
            free(cpu_state);
            free(json_str);
            return;
        }

        pos += written;

        // Add a comma if this is not the last element
        if (i < length - 1)
        {
            json_str[pos++] = ',';
        }
    }

    json_str[pos++] = ']';
    json_str[pos++] = ')';
    json_str[pos] = '\0';

    emscripten_run_script(json_str);

    free(cpu_state);
    free(json_str);
}

void tama_wasm_load(u32_t *saved_state)
{
    cpu_state_t cpu_state;
    memcpy(&cpu_state, saved_state, sizeof(cpu_state_t));
    restore_from_serializable_state(&cpu_state);
    tamalib_refresh_hw();
}

void tama_wasm_set_value(u32_t *saved_state, size_t index, u32_t value)
{
    saved_state[index] = value;
}

cpu_state_t *create_serializable_state()
{
    state_t *src = cpu_get_state();
    cpu_state_t *dest = (cpu_state_t *)malloc(sizeof(cpu_state_t));

    if (dest == NULL)
    {
        return NULL;
    }

    // Copy register values
    dest->pc = *(src->pc);
    dest->x = *(src->x);
    dest->y = *(src->y);
    dest->a = *(src->a);
    dest->b = *(src->b);
    dest->np = *(src->np);
    dest->sp = *(src->sp);
    dest->flags = *(src->flags);

    // Copy timer values
    dest->tick_counter = *(src->tick_counter);
    dest->clk_timer_2hz_timestamp = *(src->clk_timer_2hz_timestamp);
    dest->clk_timer_4hz_timestamp = *(src->clk_timer_4hz_timestamp);
    dest->clk_timer_8hz_timestamp = *(src->clk_timer_8hz_timestamp);
    dest->clk_timer_16hz_timestamp = *(src->clk_timer_16hz_timestamp);
    dest->clk_timer_32hz_timestamp = *(src->clk_timer_32hz_timestamp);
    dest->clk_timer_64hz_timestamp = *(src->clk_timer_64hz_timestamp);
    dest->clk_timer_128hz_timestamp = *(src->clk_timer_128hz_timestamp);
    dest->clk_timer_256hz_timestamp = *(src->clk_timer_256hz_timestamp);
    dest->prog_timer_timestamp = *(src->prog_timer_timestamp);
    dest->prog_timer_enabled = *(src->prog_timer_enabled);
    dest->prog_timer_data = *(src->prog_timer_data);
    dest->prog_timer_rld = *(src->prog_timer_rld);

    // Copy call depth
    dest->call_depth = *(src->call_depth);

    // Copy interrupt structures
    memcpy(dest->interrupts, src->interrupts, INT_SLOT_NUM * sizeof(interrupt_t));

    // Copy CPU halt status
    dest->cpu_halted = *(src->cpu_halted);

    // Copy memory buffer
    memcpy(dest->memory, src->memory, MEM_BUFFER_SIZE * sizeof(MEM_BUFFER_TYPE));

    return dest;
}

void restore_from_serializable_state(cpu_state_t *src)
{
    state_t *dst = cpu_get_state();

    // Copy register values
    *(dst->pc) = src->pc;
    *(dst->x) = src->x;
    *(dst->y) = src->y;
    *(dst->a) = src->a;
    *(dst->b) = src->b;
    *(dst->np) = src->np;
    *(dst->sp) = src->sp;
    *(dst->flags) = src->flags;

    // Copy timer values
    *(dst->tick_counter) = src->tick_counter;
    *(dst->clk_timer_2hz_timestamp) = src->clk_timer_2hz_timestamp;
    *(dst->clk_timer_4hz_timestamp) = src->clk_timer_4hz_timestamp;
    *(dst->clk_timer_8hz_timestamp) = src->clk_timer_8hz_timestamp;
    *(dst->clk_timer_16hz_timestamp) = src->clk_timer_16hz_timestamp;
    *(dst->clk_timer_32hz_timestamp) = src->clk_timer_32hz_timestamp;
    *(dst->clk_timer_64hz_timestamp) = src->clk_timer_64hz_timestamp;
    *(dst->clk_timer_128hz_timestamp) = src->clk_timer_128hz_timestamp;
    *(dst->clk_timer_256hz_timestamp) = src->clk_timer_256hz_timestamp;
    *(dst->prog_timer_timestamp) = src->prog_timer_timestamp;
    *(dst->prog_timer_enabled) = src->prog_timer_enabled;
    *(dst->prog_timer_data) = src->prog_timer_data;
    *(dst->prog_timer_rld) = src->prog_timer_rld;

    // Copy call depth
    *(dst->call_depth) = src->call_depth;

    // Copy interrupt structures
    memcpy(dst->interrupts, src->interrupts, INT_SLOT_NUM * sizeof(interrupt_t));

    // Copy CPU halt status
    *(dst->cpu_halted) = src->cpu_halted;

    // Copy memory buffer
    memcpy(dst->memory, src->memory, MEM_BUFFER_SIZE * sizeof(MEM_BUFFER_TYPE));
}