import dynamic from 'next/dynamic';

const BeholdWidget = dynamic(
  () => import('@behold/react').then(mod => mod.default),
  { ssr: false }
);

const Behold = () => {
  return <BeholdWidget feedId="3x6yLpBwvqfwMzEaMvCz" />;
};

export default Behold;
