import React, { useState } from "react";

interface Feature {
  locationID: number;
  locationFeature: string;
  notes: string;
}

interface FeaturesListWithToggleProps {
  featuresList: Feature[];
}

const FeaturesListWithToggle: React.FC<FeaturesListWithToggleProps> = ({ featuresList }) => {
  const [showMore, setShowMore] = useState(false);
  const maxFeaturesToShow = 2; 

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const featuresToDisplay = showMore ? featuresList : featuresList.slice(0, maxFeaturesToShow);

  return (
    <div className="features-list">
      {featuresToDisplay.map((feature) => (
        <div key={feature.locationID}>
          <p><strong>Feature:</strong> {feature.locationFeature}</p>
          <p><strong>Notes:</strong> {feature.notes}</p>
        </div>
      ))}
      {featuresList.length > maxFeaturesToShow && (
        <button onClick={toggleShowMore} className="toggle-button">
          {showMore ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default FeaturesListWithToggle;
