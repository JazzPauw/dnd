import React, { useRef } from "react";
import { Upload, X } from "lucide-react";

/**
 * ImageInput — picks a local file and stores it as a base64 data URL in `value`.
 * Works fully offline; no server uploads required.
 */
export default function ImageInput({ value, onChange, testid }) {
  const ref = useRef(null);
  const pick = () => ref.current?.click();
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 6 * 1024 * 1024) { alert("Image too large (max 6MB)."); return; }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(f);
  };
  return (
    <div className="space-y-2" data-testid={testid}>
      <div className="flex gap-2">
        <button type="button" onClick={pick} className="btn-organic !py-1 !px-3 text-xs"><Upload size={12}/> Upload image</button>
        {value && <button type="button" onClick={() => onChange("")} className="btn-ghost text-xs"><X size={12}/> Remove</button>}
        <input type="text" placeholder="…or paste URL" value={value || ""} onChange={(e) => onChange(e.target.value)} className="flex-1 text-xs"/>
      </div>
      <input ref={ref} type="file" accept="image/*" onChange={onFile} className="hidden" data-testid={`${testid}-file`}/>
      {value && <img src={value} alt="" className="max-h-40 object-cover border border-white/10"/>}
    </div>
  );
}
