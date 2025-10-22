import React, { useState } from 'react';
import Breadcrumb, { buildBreadcrumbItems, buildProductBreadcrumbs, buildFilterBreadcrumbs } from './Breadcrumb';

const BreadcrumbTest = () => {
  const [testResults, setTestResults] = useState([]);

  const runTests = () => {
    const results = [];

    // Test 1: Basic breadcrumb items
    const basicItems = buildBreadcrumbItems({
      category: 'Electrical',
      subcategory: 'Switches',
      subSubcategory: 'Wall Switches',
      currentPage: 'category'
    });
    results.push({
      test: 'Basic category hierarchy',
      passed: basicItems.length === 3 && basicItems[0].label === 'Electrical',
      items: basicItems
    });

    // Test 2: Product breadcrumbs
    const productAnchor = {
      category: 'Electrical',
      subcategory: 'Lighting',
      subSubcategory: 'LED Bulbs',
      brand: 'Philips',
      productType: 'Smart Bulb'
    };
    const productItems = buildProductBreadcrumbs(productAnchor);
    results.push({
      test: 'Product page breadcrumbs',
      passed: productItems.length >= 3,
      items: productItems
    });

    // Test 3: Filter breadcrumbs
    const filters = {
      brand: ['Philips', 'Havells'],
      productType: ['LED Bulb'],
      category: ['Lighting']
    };
    const filterItems = buildFilterBreadcrumbs(filters, 'Electrical');
    results.push({
      test: 'Filter breadcrumbs',
      passed: filterItems.length >= 1,
      items: filterItems
    });

    // Test 4: Empty breadcrumbs
    const emptyItems = buildBreadcrumbItems({});
    results.push({
      test: 'Empty breadcrumbs',
      passed: emptyItems.length === 0,
      items: emptyItems
    });

    setTestResults(results);
  };

  const handleNavigation = (path, type, value) => {
    console.log('Navigation:', { path, type, value });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Breadcrumb Component Test</h1>
        
        <button
          onClick={runTests}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Run Tests
        </button>

        {testResults.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Test Results</h2>
            {testResults.map((result, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center mb-2">
                  <span className={`w-4 h-4 rounded-full mr-2 ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <h3 className="font-medium">{result.test}</h3>
                  <span className="ml-2 text-sm text-gray-500">
                    ({result.passed ? 'PASSED' : 'FAILED'})
                  </span>
                </div>
                
                <div className="mb-2">
                  <strong>Items count:</strong> {result.items.length}
                </div>
                
                {result.items.length > 0 && (
                  <div className="border-t pt-2">
                    <strong>Breadcrumb Preview:</strong>
                    <div className="mt-2">
                      <Breadcrumb
                        items={result.items}
                        onNavigate={handleNavigation}
                        showHome={true}
                      />
                    </div>
                  </div>
                )}
                
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600">View items data</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.items, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Interactive Examples</h2>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2">Category Navigation</h3>
              <Breadcrumb
                items={[
                  { label: 'Electronics', path: '#category/electronics', type: 'category', value: 'Electronics' },
                  { label: 'Switches', path: '#subcategory/switches', type: 'subcategory', value: 'Switches' },
                  { label: 'Wall Switches', path: '#sub-subcategory/wall-switches', type: 'sub-subcategory', value: 'Wall Switches' }
                ]}
                onNavigate={handleNavigation}
                showHome={true}
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2">Filter Navigation</h3>
              <Breadcrumb
                items={[
                  { label: 'Lighting', path: '#category/lighting', type: 'category', value: 'Lighting' },
                  { label: 'Brand: Philips', path: '#category/lighting/filter/brand/philips', type: 'brand', value: 'Philips', isFilter: true },
                  { label: 'Type: LED Bulb', path: '#category/lighting/filter/productType/led-bulb', type: 'productType', value: 'LED Bulb', isFilter: true }
                ]}
                onNavigate={handleNavigation}
                showHome={true}
                separator="arrow"
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2">Product Details</h3>
              <Breadcrumb
                items={[
                  { label: 'Electrical', path: '#category/electrical', type: 'category', value: 'Electrical' },
                  { label: 'Lighting', path: '#subcategory/lighting', type: 'subcategory', value: 'Lighting' },
                  { label: 'LED Bulbs', path: '#sub-subcategory/led-bulbs', type: 'sub-subcategory', value: 'LED Bulbs' },
                  { label: 'Philips', path: '#category/lighting/filter/brand/philips', type: 'brand', value: 'Philips' },
                  { label: 'Smart Bulb', path: '#category/lighting/filter/productType/smart-bulb', type: 'productType', value: 'Smart Bulb' }
                ]}
                onNavigate={handleNavigation}
                showHome={true}
                separator="slash"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreadcrumbTest;