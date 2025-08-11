import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  BookingActivityChart, 
  UserRegistrationChart, 
  FacilityApprovalChart, 
  ActiveSportsChart,
  EarningsChart 
} from '../components/DashboardCharts';
import { Spinner } from '../../components/ui/Spinner';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')} text-${color.replace('border-', '').replace('-500', '-500')}`}>
        {icon}
      </div>
    </div>
  </div>
);

interface ChartCardProps {
  title: string;
  children?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      {children || (
        <p className="text-gray-500">Chart placeholder - will be implemented with a charting library</p>
      )}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalBookings: 0,
    totalCourts: 0,
  });
  
  const [chartData, setChartData] = useState<any>({
    bookingTrends: [],
    userTrends: [],
    facilityTrends: [],
    activeSports: [],
    earningsSimulation: [],
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Import the admin API service
        const { adminAPI } = await import('../../services/admin');
        
        // Fetch real statistics from the API
        const response = await adminAPI.getStats();
        const data = response.data;
        
        // Update the stats with real data
        setStats({
          totalUsers: data.totalUsers || 0,
          totalOwners: data.totalOwners || 0,
          totalBookings: data.totalBookings || 0,
          totalCourts: data.totalFacilities || 0,
        });
        
        // Update chart data
        setChartData({
          bookingTrends: data.bookingTrends || [],
          userTrends: data.userTrends || [],
          facilityTrends: data.facilityTrends || [],
          activeSports: data.activeSports || [],
          earningsSimulation: data.earningsSimulation || [],
        });
        
        console.log('Admin dashboard stats loaded:', data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Fallback to default values if API call fails
        setStats({
          totalUsers: 0,
          totalOwners: 0,
          totalBookings: 0,
          totalCourts: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout currentPage="dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>} 
              color="border-blue-500" 
            />
            <StatCard 
              title="Facility Owners" 
              value={stats.totalOwners} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>} 
              color="border-green-500" 
            />
            <StatCard 
              title="Total Bookings" 
              value={stats.totalBookings} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>} 
              color="border-purple-500" 
            />
            <StatCard 
              title="Active Courts" 
              value={stats.totalCourts} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>} 
              color="border-yellow-500" 
            />
          </div>

          {/* Charts - First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Booking Activity Over Time">
              {chartData.bookingTrends.length > 0 ? (
                <BookingActivityChart 
                  data={chartData.bookingTrends} 
                  title="Monthly Booking Activity"
                />
              ) : (
                <p className="text-gray-500">No booking data available</p>
              )}
            </ChartCard>
            <ChartCard title="User Registration Trends">
              {chartData.userTrends.length > 0 ? (
                <UserRegistrationChart 
                  data={chartData.userTrends} 
                  title="Monthly User Registrations"
                />
              ) : (
                <p className="text-gray-500">No user registration data available</p>
              )}
            </ChartCard>
          </div>

          {/* Charts - Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Facility Approval Trends">
              {chartData.facilityTrends.length > 0 ? (
                <FacilityApprovalChart 
                  data={chartData.facilityTrends} 
                  title="Facility Status Distribution"
                />
              ) : (
                <p className="text-gray-500">No facility data available</p>
              )}
            </ChartCard>
            <ChartCard title="Most Active Sports">
              {chartData.activeSports.length > 0 ? (
                <ActiveSportsChart 
                  data={chartData.activeSports} 
                  title="Sports Distribution"
                />
              ) : (
                <p className="text-gray-500">No sports data available</p>
              )}
            </ChartCard>
            <ChartCard title="Earnings Simulation">
              {chartData.earningsSimulation.length > 0 ? (
                <EarningsChart 
                  data={chartData.earningsSimulation} 
                  title="Monthly Earnings (₹)"
                />
              ) : (
                <p className="text-gray-500">No earnings data available</p>
              )}
            </ChartCard>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Dashboard;