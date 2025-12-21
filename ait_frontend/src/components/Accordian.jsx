import { useEffect, useState } from "react";

const Accordian = ({possibleCauses, nextSteps, AISummary}) => {
    const [filled, setFilled] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setFilled(true), 50);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="w-full">
           <div className="p-4">
                <h3 className="font-bold text-gray-800">AI Summary</h3>
                <div className="p-2 relative overflow-hidden">
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            background: '#bfdbfe',
                            width: filled ? '100%' : '0%',
                            transition: 'width 1200ms ease'
                        }}
                    />
                    <div className="relative">{AISummary}</div>
                </div>
                <h3 className="font-bold text-gray-800 mt-2">Possible Causes</h3>
                <div className="p-4">
                    {possibleCauses.map((cause, index) => (
                        <li key={index}>{cause}</li>
                    ))}
                </div>
                <h3 className="font-bold text-gray-800 mt-2">Next Steps</h3>
                <div className="p-4">
                    {nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Accordian;