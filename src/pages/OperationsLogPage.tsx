import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  RefreshCw, 
  Search, 
  Filter, 
  Plus, 
  Calendar,
  User,
  Server,
  Monitor,
  Network,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Download,
  MapPin,
  X,
  Save
} from 'lucide-react';

interface Activity {
  id: number;
  date: string;
  client: string;
  emplacement: string;
  project_id?: number;
  action: string;
  raison: string;
  resultats: string;
  equipements_touches: string[];
  technicien: string;
  type_activite: 'intervention' | 'optimisation' | 'formation' | 'resolution';
}

interface Update {
  id: number;
  date: string;
  niveau: 'equipement' | 'type' | 'client';
  reference: string;
  type_equipement: string;
  version_avant: string;
  version_apres: string;
  type_update: 'securite' | 'fonctionnalite' | 'correctif';
  downtime?: number;
  tests_effectues: string;
  impact: 'critique' | 'majeur' | 'moyen' | 'mineur';
  technicien: string;
  validation?: string;
}

type ViewType = 'chronological' | 'by-emplacement' | 'by-equipment' | 'by-type';
type TabType = 'activities' | 'updates';

const OperationsLogPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('activities');
  const [currentView, setCurrentView] = useState<ViewType>('chronological');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    technicien: '',
    type: '',
    emplacement: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<'activity' | 'update'>('activity');
  const [formData, setFormData] = useState<any>({
    // Activity form
    activityDate: new Date().toISOString().split('T')[0],
    activityClient: '',
    activityEmplacement: '',
    activityAction: '',
    activityRaison: '',
    activityResultats: '',
    activityEquipements: '',
    activityTechnicien: '',
    activityType: 'intervention',
    // Update form
    updateDate: new Date().toISOString().split('T')[0],
    updateNiveau: 'equipement',
    updateReference: '',
    updateTypeEquipement: '',
    updateVersionAvant: '',
    updateVersionApres: '',
    updateTypeUpdate: 'securite',
    updateDowntime: '',
    updateTestsEffectues: '',
    updateImpact: 'moyen',
    updateTechnicien: '',
    updateValidation: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activitiesRes, updatesRes] = await Promise.all([
        fetch('/api/operations/activities'),
        fetch('/api/operations/updates')
      ]);
      
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
      }
      
      if (updatesRes.ok) {
        const updatesData = await updatesRes.json();
        setUpdates(updatesData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.emplacement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.technicien.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTechnicien = !filters.technicien || activity.technicien === filters.technicien;
    const matchesType = !filters.type || activity.type_activite === filters.type;
    const matchesEmplacement = !filters.emplacement || activity.emplacement === filters.emplacement;
    
    const activityDate = new Date(activity.date);
    const matchesDateFrom = !filters.dateFrom || activityDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || activityDate <= new Date(filters.dateTo);
    
    return matchesSearch && matchesTechnicien && matchesType && matchesEmplacement && matchesDateFrom && matchesDateTo;
  });

  const filteredUpdates = updates.filter(update => {
    const matchesSearch = !searchTerm ||
      update.type_equipement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.technicien.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesNiveau = !filters.type || update.niveau === filters.type;
    const matchesTechnicien = !filters.technicien || update.technicien === filters.technicien;
    
    const updateDate = new Date(update.date);
    const matchesDateFrom = !filters.dateFrom || updateDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || updateDate <= new Date(filters.dateTo);
    
    return matchesSearch && matchesNiveau && matchesTechnicien && matchesDateFrom && matchesDateTo;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'intervention': return <Server className="w-5 h-5" />;
      case 'optimisation': return <RefreshCw className="w-5 h-5" />;
      case 'formation': return <User className="w-5 h-5" />;
      case 'resolution': return <CheckCircle className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getUpdateImpactColor = (impact: string) => {
    switch (impact) {
      case 'critique': return 'bg-red-100 text-red-700 border-red-200';
      case 'majeur': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moyen': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'mineur': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const renderChronologicalView = () => {
    const allItems = [
      ...activities.map(a => ({ ...a, type: 'activity' as const })),
      ...updates.map(u => ({ ...u, type: 'update' as const }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="space-y-4">
        {allItems.map((item) => (
          <motion.div
            key={`${item.type}-${item.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            {item.type === 'activity' ? (
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
                  {getActivityIcon((item as Activity).type_activite)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{(item as Activity).action}</h3>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date((item as Activity).date).toLocaleDateString('fr-CA')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-slate-500">Client:</span>
                      <p className="font-medium text-slate-800">{(item as Activity).client}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Emplacement:</span>
                      <p className="font-medium text-slate-800">{(item as Activity).emplacement}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Technicien:</span>
                      <p className="font-medium text-slate-800">{(item as Activity).technicien}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm text-slate-500">Raison:</span>
                    <p className="text-slate-700">{(item as Activity).raison}</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm text-slate-500">Résultats:</span>
                    <p className="text-slate-700">{(item as Activity).resultats}</p>
                  </div>
                  {(item as Activity).equipements_touches.length > 0 && (
                    <div>
                      <span className="text-sm text-slate-500">Équipements touchés:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(item as Activity).equipements_touches.map((eq, idx) => (
                          <span key={idx} className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-700">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">Mise à jour {(item as Update).type_equipement}</h3>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date((item as Update).date).toLocaleDateString('fr-CA')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-slate-500">Référence:</span>
                      <p className="font-medium text-slate-800">{(item as Update).reference}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Technicien:</span>
                      <p className="font-medium text-slate-800">{(item as Update).technicien}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Impact:</span>
                      <span className={`px-2 py-1 rounded text-xs border ${getUpdateImpactColor((item as Update).impact)}`}>
                        {(item as Update).impact}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm text-slate-500">Version:</span>
                    <p className="text-slate-700">
                      <span className="line-through text-slate-400">{(item as Update).version_avant}</span>
                      {' → '}
                      <span className="font-semibold text-green-600">{(item as Update).version_apres}</span>
                    </p>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm text-slate-500">Tests effectués:</span>
                    <p className="text-slate-700">{(item as Update).tests_effectues}</p>
                  </div>
                  {(item as Update).downtime && (
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      Downtime: {(item as Update).downtime} minutes
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };


  const renderByEmplacementView = () => {
    const emplacements = [...new Set(activities.map(a => a.emplacement))];
    
    return (
      <div className="space-y-6">
        {emplacements.map(emplacement => {
          const emplacementActivities = activities.filter(a => a.emplacement === emplacement);
          return (
            <div key={emplacement} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                {emplacement}
                <span className="text-sm font-normal text-slate-500">({emplacementActivities.length} activité{emplacementActivities.length > 1 ? 's' : ''})</span>
              </h3>
              <div className="space-y-3">
                {emplacementActivities.map(activity => (
                  <div key={activity.id} className="border-l-4 border-primary-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">{activity.action}</span>
                      <span className="text-sm text-slate-500">{new Date(activity.date).toLocaleDateString('fr-CA')}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Client: {activity.client}</span>
                      <span>•</span>
                      <span>Technicien: {activity.technicien}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{activity.raison}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderByEquipmentView = () => {
    const allEquipment = new Set<string>();
    activities.forEach(a => a.equipements_touches.forEach(eq => allEquipment.add(eq)));
    updates.forEach(u => allEquipment.add(u.reference));
    
    return (
      <div className="space-y-6">
        {Array.from(allEquipment).map(equipment => {
          const relatedActivities = activities.filter(a => a.equipements_touches.includes(equipment));
          const relatedUpdates = updates.filter(u => u.reference === equipment);
          
          return (
            <div key={equipment} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary-600" />
                {equipment}
              </h3>
              {relatedUpdates.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-700 mb-2">Mises à jour ({relatedUpdates.length})</h4>
                  <div className="space-y-2">
                    {relatedUpdates.map(update => (
                      <div key={update.id} className="bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">
                            {update.version_avant} → {update.version_apres}
                          </span>
                          <span className="text-sm text-slate-500">{new Date(update.date).toLocaleDateString('fr-CA')}</span>
                        </div>
                        <p className="text-sm text-slate-600">{update.type_update}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {relatedActivities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Activités ({relatedActivities.length})</h4>
                  <div className="space-y-2">
                    {relatedActivities.map(activity => (
                      <div key={activity.id} className="bg-primary-50 p-3 rounded border border-primary-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">{activity.action}</span>
                          <span className="text-sm text-slate-500">{new Date(activity.date).toLocaleDateString('fr-CA')}</span>
                        </div>
                        <p className="text-sm text-slate-600">{activity.raison}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderByTypeView = () => {
    const activityTypes = [...new Set(activities.map(a => a.type_activite))];
    const updateTypes = [...new Set(updates.map(u => u.type_equipement))];
    
    return (
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Types d'activités</h3>
          <div className="space-y-4">
            {activityTypes.map(type => {
              const typeActivities = activities.filter(a => a.type_activite === type);
              return (
                <div key={type} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800 capitalize">{type}</h4>
                    <span className="text-sm text-slate-500">{typeActivities.length}</span>
                  </div>
                  <div className="space-y-2">
                    {typeActivities.slice(0, 3).map(activity => (
                      <div key={activity.id} className="text-sm text-slate-600 border-l-2 border-primary-500 pl-2">
                        {activity.action}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Types d'équipements</h3>
          <div className="space-y-4">
            {updateTypes.map(type => {
              const typeUpdates = updates.filter(u => u.type_equipement === type);
              return (
                <div key={type} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">{type}</h4>
                    <span className="text-sm text-slate-500">{typeUpdates.length}</span>
                  </div>
                  <div className="space-y-2">
                    {typeUpdates.slice(0, 3).map(update => (
                      <div key={update.id} className="text-sm text-slate-600 border-l-2 border-blue-500 pl-2">
                        {update.version_avant} → {update.version_apres}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chronological':
        return renderChronologicalView();
      case 'by-emplacement':
        return renderByEmplacementView();
      case 'by-equipment':
        return renderByEquipmentView();
      case 'by-type':
        return renderByTypeView();
      default:
        return renderChronologicalView();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary-600" />
            Journal d'Opérations
          </h1>
          <p className="text-slate-600 mt-1">Registre complet des activités et mises à jour</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter une entrée
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setCurrentTab('activities')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            currentTab === 'activities'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Activités Client
        </button>
        <button
          onClick={() => setCurrentTab('updates')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            currentTab === 'updates'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Mises à Jour
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.technicien}
            onChange={(e) => setFilters({ ...filters, technicien: e.target.value })}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Tous les techniciens</option>
            {[...new Set([...activities.map(a => a.technicien), ...updates.map(u => u.technicien)])].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            placeholder="Date de début"
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            placeholder="Date de fin"
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        {currentTab === 'activities' && (
          <div className="grid grid-cols-2 gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Tous les types</option>
              <option value="intervention">Intervention</option>
              <option value="optimisation">Optimisation</option>
              <option value="formation">Formation</option>
              <option value="resolution">Résolution</option>
            </select>
            <select
              value={filters.emplacement}
              onChange={(e) => setFilters({ ...filters, emplacement: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Tous les emplacements</option>
              {[...new Set(activities.map(a => a.emplacement))].map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* View Selector */}
      <div className="flex space-x-2">
        {[
          { id: 'chronological', label: 'Chronologique', icon: Clock },
          { id: 'by-emplacement', label: 'Par Emplacement', icon: MapPin },
          { id: 'by-equipment', label: 'Par Équipement', icon: Monitor },
          { id: 'by-type', label: 'Par Type', icon: Network }
        ].map(view => (
          <motion.button
            key={view.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView(view.id as ViewType)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              currentView === view.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <view.icon className="w-4 h-4" />
            {view.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div>
        {currentTab === 'activities' && filteredActivities.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Aucune activité trouvée</p>
          </div>
        )}
        {currentTab === 'updates' && filteredUpdates.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Aucune mise à jour trouvée</p>
          </div>
        )}
        {renderCurrentView()}
      </div>

      {/* Modal d'ajout */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-2xl font-bold text-slate-800">Ajouter une entrée</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 p-4 border-b border-slate-200 bg-slate-50">
                <button
                  onClick={() => setModalTab('activity')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    modalTab === 'activity'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Activité Client
                </button>
                <button
                  onClick={() => setModalTab('update')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    modalTab === 'update'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Mise à Jour
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (modalTab === 'activity') {
                      const activityData = {
                        date: new Date(formData.activityDate).toISOString(),
                        client: formData.activityClient,
                        emplacement: formData.activityEmplacement,
                        action: formData.activityAction,
                        raison: formData.activityRaison,
                        resultats: formData.activityResultats,
                        equipements_touches: formData.activityEquipements
                          .split(',')
                          .map((eq: string) => eq.trim())
                          .filter((eq: string) => eq),
                        technicien: formData.activityTechnicien,
                        type_activite: formData.activityType,
                        project_id: null
                      };

                      const response = await fetch('/api/operations/activities', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(activityData)
                      });

                      if (response.ok) {
                        await fetchData();
                        setShowAddModal(false);
                        setFormData({
                          activityDate: new Date().toISOString().split('T')[0],
                          activityClient: '',
                          activityEmplacement: '',
                          activityAction: '',
                          activityRaison: '',
                          activityResultats: '',
                          activityEquipements: '',
                          activityTechnicien: '',
                          activityType: 'intervention'
                        });
                      }
                    } else {
                      const updateData = {
                        date: new Date(formData.updateDate).toISOString(),
                        niveau: formData.updateNiveau,
                        reference: formData.updateReference,
                        type_equipement: formData.updateTypeEquipement,
                        version_avant: formData.updateVersionAvant,
                        version_apres: formData.updateVersionApres,
                        type_update: formData.updateTypeUpdate,
                        downtime: formData.updateDowntime ? parseInt(formData.updateDowntime) : null,
                        tests_effectues: formData.updateTestsEffectues,
                        impact: formData.updateImpact,
                        technicien: formData.updateTechnicien,
                        validation: formData.updateValidation || null
                      };

                      const response = await fetch('/api/operations/updates', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                      });

                      if (response.ok) {
                        await fetchData();
                        setShowAddModal(false);
                        setFormData({
                          updateDate: new Date().toISOString().split('T')[0],
                          updateNiveau: 'equipement',
                          updateReference: '',
                          updateTypeEquipement: '',
                          updateVersionAvant: '',
                          updateVersionApres: '',
                          updateTypeUpdate: 'securite',
                          updateDowntime: '',
                          updateTestsEffectues: '',
                          updateImpact: 'moyen',
                          updateTechnicien: '',
                          updateValidation: ''
                        });
                      }
                    }
                  } catch (error) {
                    console.error('Erreur lors de l\'ajout:', error);
                  }
                }}
                className="p-6 space-y-4"
              >
                {modalTab === 'activity' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.activityDate}
                          onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Client <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.activityClient}
                          onChange={(e) => setFormData({ ...formData, activityClient: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="BZ Inc"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Emplacement <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.activityEmplacement}
                        onChange={(e) => setFormData({ ...formData, activityEmplacement: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Bureau principal - Montréal"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Action effectuée <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.activityAction}
                        onChange={(e) => setFormData({ ...formData, activityAction: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Migration serveur de base de données"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Raison <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.activityRaison}
                        onChange={(e) => setFormData({ ...formData, activityRaison: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Amélioration de la sécurité et performance..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Résultats <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.activityResultats}
                        onChange={(e) => setFormData({ ...formData, activityResultats: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Temps de réponse réduit de 40%, sécurité renforcée..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Équipements touchés (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        value={formData.activityEquipements}
                        onChange={(e) => setFormData({ ...formData, activityEquipements: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Serveur-DB-001, Routeur-Core-01"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Technicien <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.activityTechnicien}
                          onChange={(e) => setFormData({ ...formData, activityTechnicien: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Marie Dubois"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Type d'activité <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.activityType}
                          onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="intervention">Intervention</option>
                          <option value="optimisation">Optimisation</option>
                          <option value="formation">Formation</option>
                          <option value="resolution">Résolution</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.updateDate}
                          onChange={(e) => setFormData({ ...formData, updateDate: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Niveau <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.updateNiveau}
                          onChange={(e) => setFormData({ ...formData, updateNiveau: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="equipement">Équipement individuel</option>
                          <option value="type">Type d'équipement</option>
                          <option value="client">Client/Location</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Référence <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.updateReference}
                        onChange={(e) => setFormData({ ...formData, updateReference: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Serveur-DB-001 ou Tous les serveurs Windows"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Type d'équipement <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.updateTypeEquipement}
                        onChange={(e) => setFormData({ ...formData, updateTypeEquipement: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Serveur Windows, Routeur Cisco, etc."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Version avant <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.updateVersionAvant}
                          onChange={(e) => setFormData({ ...formData, updateVersionAvant: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Windows Server 2019"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Version après <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.updateVersionApres}
                          onChange={(e) => setFormData({ ...formData, updateVersionApres: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Windows Server 2022"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Type de mise à jour <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.updateTypeUpdate}
                          onChange={(e) => setFormData({ ...formData, updateTypeUpdate: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="securite">Sécurité</option>
                          <option value="fonctionnalite">Fonctionnalité</option>
                          <option value="correctif">Correctif</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Impact <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.updateImpact}
                          onChange={(e) => setFormData({ ...formData, updateImpact: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="critique">Critique</option>
                          <option value="majeur">Majeur</option>
                          <option value="moyen">Moyen</option>
                          <option value="mineur">Mineur</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Downtime (minutes)
                        </label>
                        <input
                          type="number"
                          value={formData.updateDowntime}
                          onChange={(e) => setFormData({ ...formData, updateDowntime: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Technicien <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.updateTechnicien}
                          onChange={(e) => setFormData({ ...formData, updateTechnicien: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Jean Martin"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tests effectués <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.updateTestsEffectues}
                        onChange={(e) => setFormData({ ...formData, updateTestsEffectues: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Tests de connectivité, tests de performance..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Validation (optionnel)
                      </label>
                      <input
                        type="text"
                        value={formData.updateValidation}
                        onChange={(e) => setFormData({ ...formData, updateValidation: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Validé par directeur IT - 2024-01-10"
                      />
                    </div>
                  </>
                )}

                {/* Footer */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OperationsLogPage;

