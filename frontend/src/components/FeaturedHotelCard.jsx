import Badge from './Badge.jsx';
import ImageCard from './ImageCard.jsx';

function FeaturedHotelCard({ hotel, image, testId, onViewDetails }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl" data-testid={testId}>
      <ImageCard src={image} alt={`${hotel.name} hotel`} className="h-48" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900">{hotel.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{hotel.city}</p>
          </div>
          <Badge>{hotel.rating} rating</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {hotel.amenities.map((amenity) => (
            <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {amenity}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            From <span className="text-lg font-bold text-slate-950">Rs. {hotel.pricePerNight.toLocaleString('en-IN')}</span>
          </p>
          <button
            className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-accent-600 focus-ring"
            type="button"
            onClick={() => onViewDetails?.(hotel, image)}
            data-testid={`featured-hotel-view-details-${hotel.id}`}
          >
            View details
          </button>
        </div>
      </div>
    </article>
  );
}

export default FeaturedHotelCard;
