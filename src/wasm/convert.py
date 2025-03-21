#!/usr/bin/env python3

import os
import hashlib


def binary_to_c_array(
    input_file="tama.b", output_file="tama_rom.h", array_name="g_program"
):
    if not os.path.isfile(input_file):
        print(f"Error: Input file '{input_file}' does not exist.")
        return False

    bytes_per_line = 12

    try:
        with open(input_file, "rb") as f:
            data = f.read()

        with open(output_file, "w") as f:
            f.write(f"// Converted from {input_file}\n")
            f.write(f"//    MD5:  {hashlib.md5(data).hexdigest()}\n")
            f.write(f"//    SHA1: {hashlib.sha1(data).hexdigest()}\n")

            f.write("\n#ifndef _TAMA_ROM_H_\n")
            f.write("#define _TAMA_ROM_H_\n\n")

            f.write(f"static const unsigned char {array_name}[] = {{\n")

            byte_count = 0
            for i in range(0, len(data), 2):
                if i % bytes_per_line == 0:
                    f.write("    ")

                if i + 1 < len(data):
                    byte1 = data[i + 1]
                    byte2 = data[i]

                    f.write(f"0x{byte1:02x}, 0x{byte2:02x}")
                    byte_count += 2
                else:
                    byte1 = data[i]
                    f.write(f"0x{byte1:02x}")
                    byte_count += 1

                if byte_count < len(data):
                    f.write(", ")

                if byte_count % bytes_per_line == 0 and byte_count < len(data):
                    f.write("\n")

            f.write("\n};\n")
            f.write("\n#endif /* _TAMA_ROM_H_ */")

        return True

    except Exception as e:
        print(f"Error: {e}")
        return False


if __name__ == "__main__":
    binary_to_c_array()
