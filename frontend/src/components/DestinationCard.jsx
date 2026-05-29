import Badge from './Badge.jsx';
import ImageCard from './ImageCard.jsx';

function DestinationCard({ destination }) {
  return (
    <article
      className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
      data-testid={destination.testId}
    >
      <ImageCard src={destination.image} alt={`${destination.city} destination`} className="h-48">
        <div className="flex h-full items-end p-5">
          <div>
            <Badge className="bg-white/90 text-slate-800">{destination.tag}</Badge>
            <h3 className="mt-3 text-2xl font-bold text-white">{destination.city}</h3>
          </div>
        </div>
      </ImageCard>
      <div className="p-5">
        <p className="text-sm leading-6 text-slate-600">{destination.description}</p>
        <p className="mt-4 text-sm font-bold text-primary-700">{destination.price}</p>
      </div>
    </article>
  );
}

export default DestinationCard;
