import { motion } from 'framer-motion';
import { Benefit } from '../features/catalog/catalogSlice';

interface BenefitCardProps {
  benefit: Benefit;
  onOpen: (benefit: Benefit) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const BenefitCard = ({ benefit, onOpen }: BenefitCardProps) => (
  <motion.article
    layout
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    exit="hidden"
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className="benefit-card"
    role="button"
    tabIndex={0}
    onClick={() => onOpen(benefit)}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen(benefit);
      }
    }}
  >
    <div className="benefit-card__header">
      <h3 className="benefit-card__title">{benefit.name}</h3>
      <span className="benefit-card__discount">{benefit.discount}</span>
    </div>
    <div className="benefit-card__meta">
      <span className="benefit-card__chip">{benefit.category}</span>
      <span className="benefit-card__chip benefit-card__chip--muted">{benefit.municipality}</span>
    </div>
  </motion.article>
);

export default BenefitCard;
