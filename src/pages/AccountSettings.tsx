import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { updateCustomerProfile, UpdateCustomerRequest } from '../services/customerApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Save, User, Phone, Mail, Globe, Calendar, UserCircle, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from '../contexts/TranslationContext';

export default function AccountSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    age: '',
    nationality: '',
    gender: '',
    profile_url: '',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        age: user.age?.toString() || '',
        nationality: user.nationality || '',
        gender: user.gender || '',
        profile_url: user.profile_url || '',
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages on change
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.customer_id) {
      setUpdateError('No user logged in');
      return;
    }

    setIsUpdating(true);
    setUpdateSuccess(false);
    setUpdateError(null);

    try {
      // Build update payload (only include changed fields)
      const updates: UpdateCustomerRequest = {};
      
      if (formData.first_name && formData.first_name !== user.first_name) {
        updates.first_name = formData.first_name;
      }
      if (formData.last_name && formData.last_name !== user.last_name) {
        updates.last_name = formData.last_name;
      }
      if (formData.phone && formData.phone !== user.phone) {
        updates.phone = formData.phone;
      }
      if (formData.age && parseInt(formData.age) !== user.age) {
        updates.age = parseInt(formData.age);
      }
      if (formData.nationality && formData.nationality !== user.nationality) {
        updates.nationality = formData.nationality;
      }
      if (formData.gender && formData.gender !== user.gender) {
        updates.gender = formData.gender;
      }
      if (formData.profile_url && formData.profile_url !== user.profile_url) {
        updates.profile_url = formData.profile_url;
      }

      if (Object.keys(updates).length === 0) {
        setUpdateError('No changes detected');
        setIsUpdating(false);
        return;
      }

      console.log('📤 Submitting updates:', updates);

      const response = await updateCustomerProfile(user.customer_id, updates);

      if (response.success) {
        setUpdateSuccess(true);
        // Update user in context
        updateUser(response.data);
        console.log('✅ Profile updated successfully');
      } else {
        throw new Error('Update failed');
      }
    } catch (error: any) {
      console.error('❌ Update error:', error);
      setUpdateError(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 max-w-4xl pt-24 pb-8">
          <Alert>
            <AlertDescription>
              {t?.pleaseLogIn || "Please log in to access account settings."}
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 max-w-4xl pt-24 pb-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t?.back || "Back"}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-6 w-6" />
              {t?.accountSettings || "Account Settings"}
            </CardTitle>
            <CardDescription>
              {t?.updatePersonalInfo || "Update your personal information and profile details"}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {updateSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  ✅ {t?.profileUpdatedSuccessfully || "Profile updated successfully!"}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {updateError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  ❌ {updateError}
                </AlertDescription>
              </Alert>
            )}

            {/* Account Info (Read-only) */}
            <div className="space-y-4 pb-6 border-b">
              <h3 className="text-sm font-semibold text-muted-foreground">Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Email (cannot be changed)</Label>
                  <div className="flex items-center gap-2 mt-1 p-2 bg-muted rounded">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Customer ID</Label>
                  <div className="flex items-center gap-2 mt-1 p-2 bg-muted rounded">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{user.customer_id}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Account Created</Label>
                  <div className="flex items-center gap-2 mt-1 p-2 bg-muted rounded">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {user.created_at ? (() => {
                        const date = new Date(user.created_at);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = String(date.getFullYear()).slice(-2);
                        return `${day}/${month}/${year}`;
                      })() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">{t?.personalInformation || "Personal Information"}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <Label htmlFor="first_name">{t?.firstName || "First Name"} *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder={t?.enterFirstName || "Enter first name"}
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="last_name">{t?.lastName || "Last Name"} *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder={t?.enterLastName || "Enter last name"}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">{t?.phoneNumber || "Phone Number"} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder={t?.enterPhoneNumber || "Enter phone number"}
                    required
                  />
                </div>

                {/* Age */}
                <div>
                  <Label htmlFor="age">{t?.age || "Age"} *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder={t?.enterAge || "Enter age"}
                    required
                  />
                </div>

                {/* Nationality */}
                <div>
                  <Label htmlFor="nationality">{t?.nationality || "Nationality"} *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    placeholder={t?.enterNationality || "Enter nationality"}
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender">{t?.gender || "Gender"} *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t?.selectGender || "Select gender"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Profile URL */}
                <div className="md:col-span-2">
                  <Label htmlFor="profile_url">Profile Picture URL (optional)</Label>
                  <Input
                    id="profile_url"
                    type="url"
                    value={formData.profile_url}
                    onChange={(e) => handleChange('profile_url', e.target.value)}
                    placeholder="https://example.com/profile-pic.jpg"
                  />
                  {formData.profile_url && (
                    <div className="mt-2">
                      <img
                        src={formData.profile_url}
                        alt="Profile preview"
                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Reset to original values
                  if (user) {
                    setFormData({
                      first_name: user.first_name || '',
                      last_name: user.last_name || '',
                      phone: user.phone || '',
                      age: user.age?.toString() || '',
                      nationality: user.nationality || '',
                      gender: user.gender || '',
                      profile_url: user.profile_url || '',
                    });
                  }
                  setUpdateSuccess(false);
                  setUpdateError(null);
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t?.saveChanges || "Save Changes"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
      
      <Footer />
    </div>
  );
}
