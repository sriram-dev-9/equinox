'use client';
import { useEffect, useRef, useState }     from "react";

const useTradingViewWidget = (scriptUrl: string, config: Record<string, unknown>, height = 600) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;
        if (containerRef.current.dataset.loaded) return;
        
        containerRef.current.innerHTML = `<div class="tradingview-widget-container__widget" style="width: 100%; height: ${height}px;"></div>`;

        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.innerHTML = JSON.stringify(config);

        script.onerror = () => {
            setError(true);
            if (containerRef.current) {
                containerRef.current.innerHTML = `
                    <div class="flex items-center justify-center h-full bg-gray-900 border border-gray-700 rounded-lg" style="height: ${height}px;">
                        <div class="text-center">
                            <div class="text-gray-400 mb-2">📈</div>
                            <div class="text-gray-300 text-lg font-semibold">TradingView Widget</div>
                            <div class="text-gray-500 text-sm">Unable to load widget</div>
                            <div class="text-gray-600 text-xs mt-2">Check network connection</div>
                        </div>
                    </div>
                `;
            }
        };

        script.onload = () => {
            if (containerRef.current) {
                containerRef.current.dataset.loaded = 'true';
            }
        };

        containerRef.current.appendChild(script);

        return () => {
            if(containerRef.current) {
                containerRef.current.innerHTML = '';
                delete containerRef.current.dataset.loaded;
            }
        }
    }, [scriptUrl, config, height])

    return containerRef;
}
export default useTradingViewWidget
