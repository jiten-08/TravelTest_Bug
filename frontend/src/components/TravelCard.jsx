import Card from './Card.jsx';

function TravelCard({ className = '', ...props }) {
  return <Card className={['transition-all hover:-translate-y-1 hover:shadow-lg', className].join(' ')} {...props} />;
}

export default TravelCard;
