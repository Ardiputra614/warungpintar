import { useState, useEffect } from "react";

export default function FormatRupiahInput({
    value,
    onChange,
    id,
    name,
    className = "",
}) {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
        if (value !== undefined && value !== null && value !== "") {
            setDisplayValue(formatRupiah(value.toString()));
        }
    }, [value]);

    function handleInput(e) {
        const rawValue = e.target.value.replace(/[^0-9]/g, ""); // hanya angka
        setDisplayValue(formatRupiah(rawValue));
        if (onChange) {
            onChange({
                target: {
                    id: id,
                    name: name,
                    value: rawValue,
                },
            });
        }
    }

    function formatRupiah(angka) {
        const numberString = angka.replace(/[^,\d]/g, "");
        const split = numberString.split(",");
        let sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        const ribuan = split[0].substr(sisa).match(/\d{3}/g);

        if (ribuan) {
            const separator = sisa ? "." : "";
            rupiah += separator + ribuan.join(".");
        }

        return "Rp " + rupiah;
    }

    return (
        <input
            id={id}
            name={name}
            className={`border rounded px-3 py-2 w-full ${className}`}
            value={displayValue}
            onChange={handleInput}
            inputMode="numeric"
            pattern="[0-9]*"
        />
    );
}
