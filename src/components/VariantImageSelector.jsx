import React from 'react';

const VariantImageSelector = ({ 
  variants = [], 
  selectedVariantIndex = null, 
  onVariantSelect, 
  size = "normal", 
  maxVariants = 6,
  showPrices = false,
  className = ""
}) => {
  const [localSelectedIndex, setLocalSelectedIndex] = React.useState(selectedVariantIndex);
  
  // Update local state when prop changes
  React.useEffect(() => {
    setLocalSelectedIndex(selectedVariantIndex);
  }, [selectedVariantIndex]);

  const handleVariantClick = (variant, variantIndex, e) => {
    e.stopPropagation(); // Prevent parent click events
    setLocalSelectedIndex(variantIndex);
    onVariantSelect?.(variant, variantIndex);
  };

  // Size variants
  const sizeClasses = {
    small: "w-7 h-7",
    normal: "w-8 h-8",
    large: "w-12 h-12",
    xlarge: "w-16 h-16"
  };

  const imageSize = sizeClasses[size] || sizeClasses.normal;
  const marginClass = size === "small" ? "mt-1" : "mt-1.5";

  if (!variants.length) return null;

  return (
    <div className={`${marginClass} flex items-center gap-2 overflow-x-auto ${className}`}>
      {variants
        .slice(0, maxVariants)
        .map((variant, variantIndex) => {
          const thumb = Array.isArray(variant.images) && variant.images.length > 0
            ? variant.images[0]
            : null;
          if (!thumb) return null;
          
          const isSelected = localSelectedIndex === variantIndex;
          
          return (
            <button
              key={variantIndex}
              onClick={(e) => handleVariantClick(variant, variantIndex, e)}
              className={`${imageSize} rounded border overflow-hidden flex-shrink-0 transition-all duration-200 hover:scale-105 ${
                isSelected 
                  ? "border-blue-500 ring-2 ring-blue-200 shadow-md" 
                  : "border-gray-200 hover:border-blue-400"
              }`}
              title={`${variant.name || `Variant ${variantIndex + 1}`}${
                showPrices && variant.price ? ` - ₹${variant.price}` : ""
              }`}
            >
              <img
                src={thumb}
                alt={variant.name || `variant-${variantIndex}`}
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}
      {variants.length > maxVariants && (
        <div className={`${imageSize} rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs flex-shrink-0`}>
          +{variants.length - maxVariants}
        </div>
      )}
    </div>
  );
};

export default VariantImageSelector;