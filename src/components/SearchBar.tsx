import { IconSearch, IconX } from './Icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="flex items-center bg-[#1C1C1E] rounded-[14px] px-4 h-14">
        <IconSearch size={20} color="#8E8E93" className="flex-shrink-0" />
        <input
          type="text"
          placeholder="Search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-full bg-transparent text-white text-[17px] placeholder-[#636366] border-none ml-3"
        />
        {value.length > 0 && (
          <button
            onClick={() => onChange('')}
            className="w-5 h-5 rounded-full bg-[#636366] flex items-center justify-center hover:bg-[#8E8E93] transition-colors press-scale"
          >
            <IconX size={12} color="#1C1C1E" />
          </button>
        )}
      </div>
    </div>
  );
}
