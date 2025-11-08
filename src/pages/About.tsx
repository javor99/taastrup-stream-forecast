import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Waves, AlertTriangle, BarChart3, Database, MapPin, Calendar, Bell } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              About AquaMonitor
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive water level monitoring and prediction system for stream and groundwater management
            </p>
          </div>

          {/* What is AquaMonitor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-6 w-6 text-primary" />
                What is AquaMonitor?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                AquaMonitor is a real-time water level monitoring and prediction platform designed to help municipalities, 
                environmental agencies, and researchers track stream and groundwater conditions. Our system combines 
                live sensor data with predictive modeling to provide accurate forecasts and early warning capabilities.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">For Users</h4>
                  <p className="text-sm text-muted-foreground">
                    Get instant access to current water levels, trend analysis, and 7-day predictions 
                    for monitoring stations across your region. Perfect for flood monitoring, drought assessment, 
                    and environmental planning.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">For Professionals</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced analytics, historical data comparison, and administrative tools for managing 
                    monitoring networks. Ideal for water resource management and environmental consulting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-6 w-6 text-primary" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alert Subscriptions */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Alert Subscriptions
                </h4>
                <p className="text-sm text-muted-foreground">
                  Stay informed about critical water level changes with our intelligent alert system. 
                  Administrators and authorized users can subscribe to individual monitoring stations to receive notifications.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Two Alert Types:</h5>
                    <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                      <li>• <strong>Above Threshold Alerts (Flooding Risk):</strong> Get notified when water levels exceed a specified percentage (e.g., 90% of max level), indicating potential flooding conditions</li>
                      <li>• <strong>Below Threshold Alerts (Drought Risk):</strong> Receive alerts when water levels fall below a specified percentage (e.g., 20% of max level), indicating drying out or drought conditions</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">How to Subscribe:</h5>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>1. Navigate to any station card on the main page</li>
                      <li>2. Click the bell icon (🔔) to open the subscription dialog</li>
                      <li>3. Select alert type (Above or Below threshold)</li>
                      <li>4. Set your desired threshold percentage using the slider</li>
                      <li>5. Click "Subscribe" to activate alerts for that station</li>
                    </ol>
                  </div>
                  <div className="bg-background/50 rounded p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> You can subscribe to multiple alert types per station and manage all subscriptions from individual station cards. Click the bell icon again to modify or remove subscriptions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Min/Max Management */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Min/Max Level Management (Admin Feature)
                </h4>
                <p className="text-sm text-muted-foreground">
                  Administrators can calibrate the minimum and maximum reference levels for each monitoring station. 
                  These values are critical as they define the baseline for all percentile calculations and status indicators.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-2">What Min/Max Values Represent:</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      By default, min/max values represent the historical extremes recorded at each station over the past 5 years:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• <strong>Minimum Level:</strong> The lowest water level recorded in the last 5 years</li>
                      <li>• <strong>Maximum Level:</strong> The highest water level recorded in the last 5 years</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">How to Edit Min/Max Values:</h5>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>1. Click the settings icon (⚙️) on any station card</li>
                      <li>2. Adjust the minimum and maximum sliders (values in centimeters)</li>
                      <li>3. Ensure minimum is always less than maximum</li>
                      <li>4. Click "Update Min/Max" to save changes</li>
                    </ol>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">Why Adjust Min/Max?</h5>
                    <p className="text-sm text-muted-foreground">
                      While historical values work well in most cases, manual adjustment may be needed when:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4 mt-1">
                      <li>• New infrastructure changes expected water level ranges</li>
                      <li>• Sensor calibration reveals historical data inaccuracies</li>
                      <li>• Climate patterns shift beyond historical norms</li>
                      <li>• Local geological changes affect typical water levels</li>
                    </ul>
                  </div>
                  <div className="bg-background/50 rounded p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Permission Note:</strong> Only administrators can edit min/max values. Municipality admins can only edit stations within their assigned municipality. Super admins can edit any station.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                How Our System Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <Database className="h-8 w-8 text-primary mx-auto" />
                  <h4 className="font-semibold">Real-Time Data Collection</h4>
                  <p className="text-sm text-muted-foreground">
                    Continuous monitoring from Vandah sensor network collecting water level measurements every 15 minutes
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Calendar className="h-8 w-8 text-primary mx-auto" />
                  <h4 className="font-semibold">40-Day Historical Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    System analyzes the last 40 days of water level data to identify trends and patterns
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto" />
                  <h4 className="font-semibold">7-Day Predictive Forecasts</h4>
                  <p className="text-sm text-muted-foreground">
                    Generalized water table model generates day-by-day predictions based on historical patterns
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Understanding Water Level Predictions
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-1">Understanding Min/Max Values & Percentiles</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      Each monitoring station has minimum and maximum values that represent the biggest and smallest 
                      water levels recorded at that location over the last 5 years. These historical extremes serve 
                      as reference points for all calculations.
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Percentiles show where current levels and predictions fall between these extremes:</strong>
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                      <li>• <strong>0th percentile:</strong> At the historical 5-year minimum level</li>
                      <li>• <strong>50th percentile:</strong> Halfway between the 5-year minimum and maximum</li>
                      <li>• <strong>100th percentile:</strong> At the historical 5-year maximum level</li>
                      <li>• <strong>Low percentiles (0-30%):</strong> Closer to the 5-year minimum (typically low water)</li>
                      <li>• <strong>High percentiles (70-100%):</strong> Closer to the 5-year maximum (typically high water)</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Note:</strong> Administrators can manually adjust min/max values if needed using the edit controls on each station card.
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-1">Status Indicators Explained</h5>
                    <div className="grid md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
                        <span className="font-medium text-green-700 dark:text-green-300">Normal:</span>
                        <p className="text-green-600 dark:text-green-400 mt-1">Water levels are within the typical safe range for this location</p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2">
                        <span className="font-medium text-yellow-700 dark:text-yellow-300">Warning:</span>
                        <p className="text-yellow-600 dark:text-yellow-400 mt-1">Water levels are elevated and require monitoring for potential issues</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                        <span className="font-medium text-red-700 dark:text-red-300">Danger:</span>
                        <p className="text-red-600 dark:text-red-400 mt-1">Water levels are at or near flood stage - immediate attention required</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant="secondary" className="mb-2">Average Accuracy: 85-92%</Badge>
                    <p className="text-sm text-muted-foreground">
                      Our models achieve high accuracy under normal conditions with sufficient historical data and nearby weather stations
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Note:</strong> Accuracy varies based on data quality, seasonal factors, local conditions, and proximity to weather monitoring stations
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                Technical Specifications
              </CardTitle>
              <CardDescription>
                Detailed information about our monitoring and prediction systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Data Sources</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time water level sensors</li>
                    <li>• Meteorological stations</li>
                    <li>• Precipitation gauges</li>
                    <li>• Historical water table data</li>
                    <li>• Geological and topographical data</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Model Parameters</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 40-day historical data window</li>
                    <li>• 7-day prediction horizon</li>
                    <li>• 15-minute data update intervals</li>
                    <li>• Multi-variable regression analysis</li>
                    <li>• Seasonal trend adjustments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Limitations */}
          <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-6 w-6" />
                Important Limitations & Considerations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Weather Station Dependency</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Prediction accuracy may be significantly lower if no nearby weather station is available. 
                      Our models rely on local meteorological data for optimal performance.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <BarChart3 className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Model Generalization</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Predictions are based on a generalized water table model. Local geological conditions, 
                      human activities, or unique environmental factors may not be fully captured.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Extreme Conditions</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Predictions may be less reliable during extreme weather events, seasonal transitions, 
                      or unprecedented conditions that fall outside historical patterns.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Database className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Minimum Data Requirements</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      <strong>Predictions are not generated if there are fewer than 37 days of historical data.</strong> 
                      Without this minimum threshold, the model cannot generate reliable forecasts. Missing data points 
                      (1, 2, or 3 consecutive days) are automatically interpolated to fill gaps, but this interpolation 
                      degrades prediction quality. The more missing days that require interpolation, the less accurate 
                      the predictions become. Continuous sensor operation and complete historical datasets are essential 
                      for maintaining forecast reliability.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-3 mt-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  💡 Always use predictions as guidance alongside local knowledge and official weather warnings. 
                  For critical decisions, consult with local water management authorities.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Support & Contact</CardTitle>
              <CardDescription>
                Need help or have questions about our monitoring system?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Technical Support</h4>
                  <p className="text-sm text-muted-foreground">
                    For technical issues, data inquiries, or API access, contact our technical team.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data & Research</h4>
                  <p className="text-sm text-muted-foreground">
                    Interested in historical data, research collaboration, or custom monitoring solutions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default About;