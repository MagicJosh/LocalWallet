import { Link } from 'react-router-dom';
import { IconCreditCard, IconPlus } from './Icons';

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-8">
        <IconCreditCard size={48} color="#8E8E93" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3 text-center">
        No Cards Yet
      </h2>
      <p className="text-[#8E8E93] text-center text-[17px] mb-10 max-w-[280px] leading-relaxed">
        Add your loyalty and membership cards to keep them all in one place.
      </p>
      <Link
        to="/add"
        className="btn-primary"
      >
        <IconPlus size={22} color="white" />
        Add Your First Card
      </Link>
    </div>
  );
}
