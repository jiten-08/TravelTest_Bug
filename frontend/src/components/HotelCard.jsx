import Badge from './Badge.jsx';
import ImageCard from './ImageCard.jsx';

function HotelCard({ hotel, image, gradient, testId }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-xl" data-testid={testId}>
      {image ? <ImageCard src={image} alt={`${hotel.name} hotel`} className="h-36" /> : <div className={['h-36 bg-gradient-to-br', gradient].join(' ')} />}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-950">{hotel.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{hotel.city}</p>
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
        <p className="mt-5 text-sm text-slate-500">
          From <span className="text-lg font-bold text-slate-950">Rs. {hotel.pricePerNight.toLocaleString('en-IN')}</span> / night
        </p>
      </div>
    </article>
  );
}

export default HotelCard;
