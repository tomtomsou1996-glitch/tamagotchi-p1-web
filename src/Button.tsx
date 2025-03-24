interface ButtonProps {
  label: "A" | "B" | "C";
  toucButton: ({
    button,
    pressed,
  }: {
    button: "A" | "B" | "C";
    pressed: boolean;
  }) => void;
}

export default function Button({ label, toucButton }: ButtonProps) {
  return (
    <button
      type="button"
      className={`
        h-10 w-10 cursor-pointer rounded-full bg-orange-700 text-white shadow-md
        shadow-orange-700
        hover:bg-orange-600
        active:translate-[2px] active:bg-orange-800 active:shadow-none
      `}
      onMouseDown={() => {
        toucButton({ button: label, pressed: true });
      }}
      onMouseUp={() => {
        toucButton({ button: label, pressed: false });
      }}
      onTouchStart={() => {
        toucButton({ button: label, pressed: true });
      }}
      onTouchEnd={() => {
        toucButton({ button: label, pressed: false });
      }}
      onTouchCancel={() => {
        toucButton({ button: label, pressed: false });
      }}
    >
      {label}
    </button>
  );
}
