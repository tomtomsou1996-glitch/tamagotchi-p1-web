import { SCREEN_WIDTH } from "./App";


interface ScreenProps {
    matrix: number[];
}

export default function Screen({ matrix }: ScreenProps) {
    const height = matrix.length;
    if (height < 1) {
        return <>No screen matrix data provided</>;
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            backgroundColor: '#cccccc',
            padding: '4px'
        }}>
            {matrix.map((rowData, rowIndex) => (
                <div
                    key={`row-${rowIndex}`}
                    className="lcd-row"
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '1px',
                        height: `8px`
                    }}
                >
                    {/* Render 32 pixels for each row by checking individual bits */}
                    {Array.from({ length: SCREEN_WIDTH }, (_, colIndex) => {
                        // Calculate bit position (MSB first, as in your C code)
                        const bitPosition = SCREEN_WIDTH - 1 - colIndex;
                        // Check if this bit is set
                        const isOn = (rowData & (1 << bitPosition)) !== 0;

                        return (
                            <div
                                key={`pixel-${rowIndex}-${colIndex}`}
                                style={{
                                    width: `8px`,
                                    height: `8px`,
                                    backgroundColor: isOn ? 'black' : 'white'
                                }}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};