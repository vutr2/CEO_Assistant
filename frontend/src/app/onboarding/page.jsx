'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Briefcase,
    Target,
    TrendingUp,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    Sparkles,
    Building2,
    Users,
    BarChart3,
    Zap,
    Shield,
    Clock
} from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        // Step 1: Personal Info
        fullName: '',
        role: '',

        // Step 2: Company Info
        companyName: '',
        companySize: '',
        industry: '',

        // Step 3: Goals
        primaryGoal: [],
        features: [],

        // Step 4: Preferences
        notificationPreference: 'all',
        language: 'vi'
    });

    const [errors, setErrors] = useState({});

    const companyRoles = [
        { value: 'ceo', label: 'CEO / Giám đốc điều hành', icon: Briefcase },
        { value: 'founder', label: 'Founder / Nhà sáng lập', icon: Sparkles },
        { value: 'director', label: 'Director / Giám đốc', icon: Building2 },
        { value: 'manager', label: 'Manager / Quản lý', icon: Users },
        { value: 'entrepreneur', label: 'Entrepreneur / Doanh nhân', icon: Target },
        { value: 'other', label: 'Khác', icon: User }
    ];

    const companySizes = [
        { value: '1-10', label: '1-10 nhân viên' },
        { value: '11-50', label: '11-50 nhân viên' },
        { value: '51-200', label: '51-200 nhân viên' },
        { value: '201-500', label: '201-500 nhân viên' },
        { value: '500+', label: '500+ nhân viên' }
    ];

    const industries = [
        { value: 'tech', label: 'Công nghệ', icon: Zap },
        { value: 'finance', label: 'Tài chính', icon: BarChart3 },
        { value: 'healthcare', label: 'Y tế', icon: Shield },
        { value: 'education', label: 'Giáo dục', icon: Users },
        { value: 'retail', label: 'Bán lẻ', icon: Building2 },
        { value: 'manufacturing', label: 'Sản xuất', icon: Briefcase },
        { value: 'services', label: 'Dịch vụ', icon: Target },
        { value: 'other', label: 'Khác', icon: Sparkles }
    ];

    const goals = [
        { value: 'productivity', label: 'Tăng năng suất', description: 'Tối ưu hóa quy trình làm việc', icon: TrendingUp },
        { value: 'decision', label: 'Ra quyết định tốt hơn', description: 'Phân tích dữ liệu và insights', icon: Target },
        { value: 'automation', label: 'Tự động hóa', description: 'Giảm thiểu công việc thủ công', icon: Zap },
        { value: 'team', label: 'Quản lý team', description: 'Cải thiện hiệu suất đội ngũ', icon: Users }
    ];

    const features = [
        { value: 'analytics', label: 'Phân tích & Báo cáo', icon: BarChart3 },
        { value: 'scheduling', label: 'Quản lý lịch trình', icon: Clock },
        { value: 'tasks', label: 'Quản lý công việc', icon: CheckCircle },
        { value: 'ai-insights', label: 'AI Insights', icon: Sparkles }
    ];

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 0:
                if (!formData.fullName.trim()) {
                    newErrors.fullName = 'Vui lòng nhập họ tên';
                }
                if (!formData.role) {
                    newErrors.role = 'Vui lòng chọn vai trò';
                }
                break;
            case 1:
                if (!formData.companyName.trim()) {
                    newErrors.companyName = 'Vui lòng nhập tên công ty';
                }
                if (!formData.companySize) {
                    newErrors.companySize = 'Vui lòng chọn quy mô công ty';
                }
                if (!formData.industry) {
                    newErrors.industry = 'Vui lòng chọn ngành nghề';
                }
                break;
            case 2:
                if (formData.primaryGoal.length === 0) {
                    newErrors.primaryGoal = 'Vui lòng chọn ít nhất một mục tiêu';
                }
                if (formData.features.length === 0) {
                    newErrors.features = 'Vui lòng chọn ít nhất một tính năng';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        if (validateStep(currentStep)) {
            // TODO: Save onboarding data to backend
            console.log('Onboarding completed:', formData);

            // Redirect to dashboard
            router.push('/dashboard/overview');
        }
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const toggleMultiSelect = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const renderProgressBar = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                    Bước {currentStep + 1} / 4
                </span>
                <span className="text-sm text-gray-500">
                    {Math.round(((currentStep + 1) / 4) * 100)}%
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
                />
            </div>
        </div>
    );

    const renderStep0 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                    <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Chào mừng bạn!
                </h2>
                <p className="text-gray-600">
                    Hãy cho chúng tôi biết thêm về bạn
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                </label>
                <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                />
                {errors.fullName && (
                    <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Vai trò của bạn *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {companyRoles.map((role) => {
                        const Icon = role.icon;
                        return (
                            <button
                                key={role.value}
                                type="button"
                                onClick={() => updateFormData('role', role.value)}
                                className={`p-4 border-2 rounded-lg transition-all text-left flex items-center space-x-3 ${
                                    formData.role === role.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${
                                    formData.role === role.value ? 'text-blue-600' : 'text-gray-400'
                                }`} />
                                <span className={`font-medium ${
                                    formData.role === role.value ? 'text-blue-900' : 'text-gray-700'
                                }`}>
                                    {role.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {errors.role && (
                    <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                )}
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
                    <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Thông tin công ty
                </h2>
                <p className="text-gray-600">
                    Giúp chúng tôi hiểu về doanh nghiệp của bạn
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên công ty *
                </label>
                <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="ABC Company"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                />
                {errors.companyName && (
                    <p className="mt-2 text-sm text-red-600">{errors.companyName}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quy mô công ty *
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {companySizes.map((size) => (
                        <button
                            key={size.value}
                            type="button"
                            onClick={() => updateFormData('companySize', size.value)}
                            className={`p-4 border-2 rounded-lg transition-all text-left ${
                                formData.companySize === size.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <span className={`font-medium ${
                                formData.companySize === size.value ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                                {size.label}
                            </span>
                        </button>
                    ))}
                </div>
                {errors.companySize && (
                    <p className="mt-2 text-sm text-red-600">{errors.companySize}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ngành nghề *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                    {industries.map((ind) => {
                        const Icon = ind.icon;
                        return (
                            <button
                                key={ind.value}
                                type="button"
                                onClick={() => updateFormData('industry', ind.value)}
                                className={`p-4 border-2 rounded-lg transition-all text-left flex items-center space-x-3 ${
                                    formData.industry === ind.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${
                                    formData.industry === ind.value ? 'text-blue-600' : 'text-gray-400'
                                }`} />
                                <span className={`font-medium ${
                                    formData.industry === ind.value ? 'text-blue-900' : 'text-gray-700'
                                }`}>
                                    {ind.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {errors.industry && (
                    <p className="mt-2 text-sm text-red-600">{errors.industry}</p>
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
                    <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Mục tiêu của bạn
                </h2>
                <p className="text-gray-600">
                    Chọn những gì bạn muốn đạt được
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mục tiêu chính * (Chọn một hoặc nhiều)
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {goals.map((goal) => {
                        const Icon = goal.icon;
                        const isSelected = formData.primaryGoal.includes(goal.value);
                        return (
                            <button
                                key={goal.value}
                                type="button"
                                onClick={() => toggleMultiSelect('primaryGoal', goal.value)}
                                className={`p-4 border-2 rounded-lg transition-all text-left ${
                                    isSelected
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <Icon className={`w-6 h-6 mt-1 ${
                                        isSelected ? 'text-blue-600' : 'text-gray-400'
                                    }`} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium ${
                                                isSelected ? 'text-blue-900' : 'text-gray-900'
                                            }`}>
                                                {goal.label}
                                            </span>
                                            {isSelected && (
                                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {goal.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                {errors.primaryGoal && (
                    <p className="mt-2 text-sm text-red-600">{errors.primaryGoal}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tính năng quan tâm * (Chọn một hoặc nhiều)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        const isSelected = formData.features.includes(feature.value);
                        return (
                            <button
                                key={feature.value}
                                type="button"
                                onClick={() => toggleMultiSelect('features', feature.value)}
                                className={`p-4 border-2 rounded-lg transition-all text-left flex items-center space-x-3 ${
                                    isSelected
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${
                                    isSelected ? 'text-blue-600' : 'text-gray-400'
                                }`} />
                                <span className={`font-medium flex-1 ${
                                    isSelected ? 'text-blue-900' : 'text-gray-700'
                                }`}>
                                    {feature.label}
                                </span>
                                {isSelected && (
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                )}
                            </button>
                        );
                    })}
                </div>
                {errors.features && (
                    <p className="mt-2 text-sm text-red-600">{errors.features}</p>
                )}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Tùy chỉnh trải nghiệm
                </h2>
                <p className="text-gray-600">
                    Cài đặt theo sở thích của bạn
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Thông báo
                </label>
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => updateFormData('notificationPreference', 'all')}
                        className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                            formData.notificationPreference === 'all'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`font-medium ${
                                    formData.notificationPreference === 'all' ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                    Tất cả thông báo
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Nhận tất cả cập nhật và thông báo
                                </p>
                            </div>
                            {formData.notificationPreference === 'all' && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData('notificationPreference', 'important')}
                        className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                            formData.notificationPreference === 'important'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`font-medium ${
                                    formData.notificationPreference === 'important' ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                    Chỉ quan trọng
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Chỉ nhận thông báo quan trọng
                                </p>
                            </div>
                            {formData.notificationPreference === 'important' && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData('notificationPreference', 'none')}
                        className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                            formData.notificationPreference === 'none'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`font-medium ${
                                    formData.notificationPreference === 'none' ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                    Tắt thông báo
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Không nhận thông báo nào
                                </p>
                            </div>
                            {formData.notificationPreference === 'none' && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                        </div>
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ngôn ngữ
                </label>
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => updateFormData('language', 'vi')}
                        className={`w-full p-4 border-2 rounded-lg transition-all text-left flex items-center justify-between ${
                            formData.language === 'vi'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <span className={`font-medium ${
                            formData.language === 'vi' ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                            Tiếng Việt
                        </span>
                        {formData.language === 'vi' && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData('language', 'en')}
                        className={`w-full p-4 border-2 rounded-lg transition-all text-left flex items-center justify-between ${
                            formData.language === 'en'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <span className={`font-medium ${
                            formData.language === 'en' ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                            English
                        </span>
                        {formData.language === 'en' && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                    </button>
                </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-900">
                        <p className="font-medium mb-1">Sẵn sàng bắt đầu!</p>
                        <p className="text-green-700">
                            Bạn có thể thay đổi các cài đặt này bất cứ lúc nào trong phần cài đặt.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {renderProgressBar()}

                    <div className="min-h-[500px]">
                        {currentStep === 0 && renderStep0()}
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                    </div>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                                currentStep === 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Quay lại</span>
                        </button>

                        {currentStep < 3 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center space-x-2"
                            >
                                <span>Tiếp tục</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex items-center space-x-2"
                            >
                                <span>Hoàn thành</span>
                                <CheckCircle className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        Cần hỗ trợ?{' '}
                        <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                            Liên hệ với chúng tôi
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
