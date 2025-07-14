<template>
  <q-page class="q-pa-sm q-pa-md-md bg-grey-1">
    <!-- Encabezado responsivo -->
    <div class="header-section q-mb-md q-mb-lg-lg">
      <div class="row items-start justify-between q-gutter-y-md">
        <div class="col-12 col-md-8">
          <h1 class="text-h5 text-h4-md text-primary q-mb-xs">
            <span class="block sm:inline">Gestión de Empleados</span>
            <span class="block sm:inline text-grey-6"> - {{ currentSede }}</span>
          </h1>
          <p class="text-body2 text-subtitle1-md text-grey-7 q-mb-sm">
            Administra toda la información de tus empleados de {{ currentSede }} en un solo lugar
          </p>
          <div class="row q-gutter-xs q-gutter-md-md q-mt-sm">
            <div class="col-auto">
              <q-chip 
                color="primary" 
                text-color="white" 
                icon="people"
                size="sm"
                class="text-caption text-body2-md"
              >
                Total: {{ filteredBySede.length }}
              </q-chip>
            </div>
            <div class="col-auto">
              <q-chip 
                color="positive" 
                text-color="white" 
                icon="person"
                size="sm"
                class="text-caption text-body2-md"
              >
                Activos: {{ activeBySede }}
              </q-chip>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4 flex justify-end">
          <div class="row q-gutter-xs full-width justify-end">
            <q-btn 
              color="primary" 
              icon="refresh" 
              :label="$q.screen.xs ? '' : 'Actualizar'" 
              @click="getDataFromApi"
              :loading="loading"
              :size="$q.screen.xs ? 'sm' : 'md'"
              rounded
              :dense="$q.screen.xs"
            />
            <q-btn 
              color="positive" 
              icon="add" 
              :label="$q.screen.xs ? '' : 'Nuevo Empleado'"
              @click="openNewEmployeeDialog"
              :size="$q.screen.xs ? 'sm' : 'md'"
              rounded
              :dense="$q.screen.xs"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Pestañas de Sedes responsivas -->
    <div class="sede-tabs q-mb-md">
      <q-card flat bordered>
        <q-tabs
          v-model="currentSede"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          :align="$q.screen.xs ? 'left' : 'justify'"
          narrow-indicator
          :mobile-arrows="$q.screen.xs"
          :outside-arrows="!$q.screen.xs"
          @update:model-value="filterBySede"
        >
          <q-tab 
            name="Villanueva" 
            icon="location_city" 
            :label="$q.screen.xs ? 'Villa' : 'Villanueva'"
            class="text-caption text-body2-sm"
          />
          <q-tab 
            name="Santa Marta" 
            icon="location_city" 
            :label="$q.screen.xs ? 'S. Marta' : 'Santa Marta'"
            class="text-caption text-body2-sm"
          />
          <q-tab 
            name="Barranquilla" 
            icon="location_city" 
            :label="$q.screen.xs ? 'B/quilla' : 'Barranquilla'"
            class="text-caption text-body2-sm"
          />
          <q-tab 
            name="Floridablanca" 
            icon="location_city" 
            :label="$q.screen.xs ? 'Florida' : 'Floridablanca'"
            class="text-caption text-body2-sm"
          />
        </q-tabs>
      </q-card>
    </div>

    <!-- Filtros y búsqueda responsivos -->
    <div class="filter-section q-mb-md">
      <div class="row q-gutter-y-sm q-gutter-x-md items-center">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            outlined
            v-model="searchTerm"
            placeholder="Buscar empleados..."
            dense
            @keyup.enter="filterEmployees"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            outlined
            v-model="departmentFilter"
            :options="departmentOptions"
            label="Departamento"
            dense
            clearable
            @update:model-value="filterEmployees"
          />
        </div>
        
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            outlined
            v-model="contractTypeFilter"
            :options="contractTypeOptions"
            label="Tipo de contrato"
            dense
            clearable
            @update:model-value="filterEmployees"
          />
        </div>
        
        <div class="col-12 col-sm-6 col-md-2">
          <q-btn
            color="secondary"
            icon="filter_list"
            :label="$q.screen.xs ? '' : 'Filtrar'"
            @click="filterEmployees"
            :size="$q.screen.xs ? 'sm' : 'md'"
            class="full-width"
            outlined
          />
        </div>
      </div>
    </div>

    <!-- Tabla de empleados responsiva -->
    <q-card flat bordered class="my-sticky-header-table">
      <!-- Vista de tabla para pantallas grandes -->
      <q-table
        v-if="!$q.screen.xs"
        flat
        title="Listado de Empleados"
        :rows="filteredEmployees"
        :columns="columns"
        row-key="Identificacion"
        :loading="loading"
        :pagination.sync="pagination"
        :rows-per-page-options="[10, 20, 50]"
        @request="onRequest"
        binary-state-sort
        class="hidden-xs"
      >
  
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.row.Estado)" class="q-pa-sm">
              {{ getStatusText(props.row.Estado) }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-x-sm">
            <q-btn
              flat
              round
              icon="visibility"
              color="blue"
              size="sm"
              @click="viewUserDetails(props.row)"
            />
            <q-btn
              flat
              round
              icon="edit"
              color="orange"
              size="sm"
              @click="editUser(props.row)"
            />
            <q-btn
              flat
              round
              :icon="(props.row.Estado === 0 || props.row.Estado === '0') ? 'person_add' : 'person_remove'"
              :color="(props.row.Estado === 0 || props.row.Estado === '0') ? 'green' : 'red'"
              size="sm"
              @click="toggleEmployeeStatus(props.row)"
            />
          </q-td>
        </template>
      </q-table>

      <!-- Vista de tarjetas para móviles -->
      <div v-if="$q.screen.xs" class="q-pa-sm">
        <div class="text-h6 q-mb-md q-px-sm text-primary">
          Listado de Empleados ({{ filteredEmployees.length }})
        </div>
        
        <!-- Loading state para móviles -->
        <div v-if="loading" class="q-pa-xl text-center">
          <q-spinner-dots size="40px" color="primary" />
          <div class="text-grey q-mt-sm">Cargando empleados...</div>
        </div>

        <!-- Tarjetas de empleados -->
        <div v-else class="q-gutter-y-sm">
          <q-card 
            v-for="employee in paginatedEmployeesMobile" 
            :key="employee.Identificacion"
            bordered
            class="q-pa-sm employee-card-mobile"
          >
            <q-card-section class="q-pa-sm">
              <div class="row items-center justify-between q-mb-xs">
                <div class="col-8">
                  <div class="text-weight-bold text-primary">
                    {{ employee.Nombre }} {{ employee.Apellido }}
                  </div>
                  <div class="text-caption text-grey-6">
                    ID: {{ employee.Identificacion }}
                  </div>
                </div>
                <div class="col-4 text-right">
                  <q-badge 
                    :color="getStatusColor(employee.Estado)" 
                    class="q-pa-xs"
                    rounded
                  >
                    {{ getStatusText(employee.Estado) }}
                  </q-badge>
                </div>
              </div>
              
              <div class="q-mb-sm">
                <div class="row q-gutter-x-md">
                  <div class="col-6">
                    <div class="text-caption text-grey-6">Cargo</div>
                    <div class="text-body2">{{ employee.Cargo || 'N/A' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-6">Teléfono</div>
                    <div class="text-body2">{{ employee.Telefono || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <div class="q-mb-sm">
                <div class="text-caption text-grey-6">Correo</div>
                <div class="text-body2 text-primary">{{ employee.Correo || 'N/A' }}</div>
              </div>

              <q-separator class="q-my-sm" />

              <div class="row justify-end q-gutter-xs">
                <q-btn
                  flat
                  dense
                  icon="visibility"
                  color="blue"
                  size="sm"
                  @click="viewUserDetails(employee)"
                  round
                />
                <q-btn
                  flat
                  dense
                  icon="edit"
                  color="orange"
                  size="sm"
                  @click="editUser(employee)"
                  round
                />
                <q-btn
                  flat
                  dense
                  :icon="(employee.Estado === 0 || employee.Estado === '0') ? 'person_add' : 'person_remove'"
                  :color="(employee.Estado === 0 || employee.Estado === '0') ? 'green' : 'red'"
                  size="sm"
                  @click="toggleEmployeeStatus(employee)"
                  round
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Paginación para móviles -->
        <div v-if="!loading && filteredEmployees.length > 0" class="q-mt-md">
          <q-pagination
            v-model="mobilePagination.page"
            :max="Math.ceil(filteredEmployees.length / mobilePagination.rowsPerPage)"
            direction-links
            flat
            color="primary"
            size="sm"
            class="justify-center"
            @update:model-value="updateMobilePagination"
          />
          <div class="text-center text-caption text-grey-6 q-mt-xs">
            Mostrando {{ getMobilePageInfo() }}
          </div>
        </div>

        <!-- Estado vacío para móviles -->
        <div v-if="!loading && filteredEmployees.length === 0" class="text-center q-pa-xl">
          <q-icon name="person_off" size="60px" color="grey-4" />
          <div class="text-grey-6 q-mt-sm">No se encontraron empleados</div>
        </div>
      </div>
    </q-card>

    <!-- Modal para mostrar detalles del empleado responsivo -->
    <q-dialog v-model="showModal" :maximized="$q.screen.lt.md" :full-width="$q.screen.xs">
      <q-card :style="$q.screen.lt.md ? '' : 'width: 90%; max-width: 1200px;'">
        <q-bar class="bg-primary text-white">
          <div :class="$q.screen.xs ? 'text-body1' : 'text-h6'">Detalles del Empleado</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>
        
        <q-card-section v-if="selectedUser" class="scroll" :style="$q.screen.xs ? 'max-height: calc(100vh - 60px);' : 'max-height: calc(100vh - 100px);'">
          <div class="row q-col-gutter-md">
            <!-- Encabezado con foto y datos básicos responsivo -->
            <div class="col-12">
              <div class="employee-header q-pa-sm q-pa-md-md bg-grey-2 rounded-borders">
                <div :class="$q.screen.xs ? 'column items-center text-center' : 'row items-center'">
                  <div :class="$q.screen.xs ? 'q-mb-sm' : 'col-auto'">
                    <q-avatar :size="$q.screen.xs ? '80px' : '100px'" :font-size="$q.screen.xs ? '42px' : '52px'" color="primary" text-color="white">
                      {{ getInitials(selectedUser.Nombre, selectedUser.Apellido) }}
                    </q-avatar>
                  </div>
                  <div :class="$q.screen.xs ? '' : 'col q-pl-md'">
                    <h2 :class="$q.screen.xs ? 'text-h6 q-ma-none q-mb-xs' : 'text-h5 q-ma-none'">{{ selectedUser.Nombre }} {{ selectedUser.Apellido }}</h2>
                    <div :class="$q.screen.xs ? 'text-body2 text-grey-7 q-mb-sm' : 'text-subtitle1 text-grey-7'">{{ selectedUser.Cargo }}</div>
                    <div :class="$q.screen.xs ? 'column q-gutter-y-xs' : 'row q-mt-sm q-gutter-md'">
                      <div :class="$q.screen.xs ? '' : 'col-auto'">
                        <q-chip icon="badge" color="blue-1" text-color="primary" :size="$q.screen.xs ? 'sm' : 'md'">
                          ID: {{ selectedUser.Identificacion }}
                        </q-chip>
                      </div>
                      <div :class="$q.screen.xs ? '' : 'col-auto'">
                        <q-chip icon="work" color="blue-1" text-color="primary">
                          {{ selectedUser.Sede }}
                        </q-chip>
                      </div>
                      <div class="col-auto">
                        <q-chip icon="event" color="blue-1" text-color="primary">
                          Ingreso: {{ formatDate(selectedUser.FechaIngresoEmpresa) }}
                        </q-chip>
                      </div>
                      <div class="col-auto">
                        <q-chip icon="attach_money" color="blue-1" text-color="primary">
                          Salario: {{ formatCurrency(selectedUser.Sueldo) }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pestañas de información -->
            <div class="col-12">
              <q-tabs
                v-model="currentTab"
                dense
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="justify"
                narrow-indicator
              >
                <q-tab name="personal" icon="person" label="Información Personal" />
                <q-tab name="laboral" icon="work" label="Información Laboral" />
                <q-tab name="social" icon="health_and_safety" label="Seguridad Social" />
                <q-tab name="documents" icon="description" label="Documentos" />
                <q-tab name="emergency" icon="emergency" label="Contacto Emergencia" />
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="currentTab" animated>
                <!-- Información Personal -->
                <q-tab-panel name="personal">
                  <div class="row q-col-gutter-md">
                    <div class="col-md-6 col-sm-12">
                      <q-card flat bordered>
                        <q-card-section>
                          <div class="text-h6">Datos Básicos</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <div class="info-grid">
                            <div class="info-item">
                              <div class="info-label">Fecha de Nacimiento</div>
                              <div class="info-value">{{ formatDate(selectedUser.FechaNacimiento) }} ({{ selectedUser.Edad }} años)</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Género</div>
                              <div class="info-value">{{ selectedUser.Genero || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Estado Civil</div>
                              <div class="info-value">{{ selectedUser.EstadoCivil || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Número de Hijos</div>
                              <div class="info-value">{{ selectedUser.Hijos || '0' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Tipo de Sangre</div>
                              <div class="info-value">{{ selectedUser.TipoSangre || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Estado del Empleado</div>
                              <div class="info-value">
                                <q-badge 
                                  :color="getStatusColor(selectedUser.Estado)" 
                                  :label="getStatusText(selectedUser.Estado)"
                                />
                              </div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-md-6 col-sm-12">
                      <q-card flat bordered>
                        <q-card-section>
                          <div class="text-h6">Información de Contacto</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <div class="info-grid">
                            <div class="info-item">
                              <div class="info-label">Correo Electrónico</div>
                              <div class="info-value">
                                <a :href="'mailto:' + selectedUser.Correo">{{ selectedUser.Correo || 'N/A' }}</a>
                              </div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Teléfono</div>
                              <div class="info-value">
                                <a :href="'tel:' + selectedUser.Telefono">{{ selectedUser.Telefono || 'N/A' }}</a>
                              </div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Dirección</div>
                              <div class="info-value">{{ selectedUser.Direccion || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Ciudad</div>
                              <div class="info-value">{{ selectedUser.Ciudad || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Estrato</div>
                              <div class="info-value">{{ selectedUser.Estrato || 'N/A' }}</div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-tab-panel>

                <!-- Información Laboral -->
                <q-tab-panel name="laboral">
                  <div class="row q-col-gutter-md">
                    <div class="col-md-6 col-sm-12">
                      <q-card flat bordered>
                        <q-card-section>
                          <div class="text-h6">Datos Laborales</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <div class="info-grid">
                            <div class="info-item">
                              <div class="info-label">Cargo</div>
                              <div class="info-value">{{ selectedUser.Cargo || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Departamento</div>
                              <div class="info-value">{{ selectedUser.Departamento || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Sede</div>
                              <div class="info-value">{{ selectedUser.Sede || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Jefe Directo</div>
                              <div class="info-value">{{ selectedUser.JefeDirecto || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Tipo de Contrato</div>
                              <div class="info-value">{{ selectedUser.TipoContrato || 'N/A' }}</div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-md-6 col-sm-12">
                      <q-card flat bordered>
                        <q-card-section>
                          <div class="text-h6">Detalles del Contrato</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <div class="info-grid">
                            <div class="info-item">
                              <div class="info-label">Fecha de Ingreso</div>
                              <div class="info-value">{{ formatDate(selectedUser.FechaIngresoEmpresa) }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Inicio de Contrato</div>
                              <div class="info-value">{{ formatDate(selectedUser.FechaInicioContrato) }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Fin de Contrato</div>
                              <div class="info-value">{{ formatDate(selectedUser.FechaFinContrato) }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Salario Base</div>
                              <div class="info-value">{{ formatCurrency(selectedUser.Sueldo) }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Bonos</div>
                              <div class="info-value">{{ formatCurrency(selectedUser.Bonos) || 'N/A' }}</div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-12">
                      <q-card flat bordered>
                        <q-card-section>
                          <div class="text-h6">Historial Laboral</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <q-markup-table flat bordered>
                            <thead>
                              <tr>
                                <th class="text-left">Cargo</th>
                                <th class="text-left">Departamento</th>
                                <th class="text-left">Fecha Inicio</th>
                                <th class="text-left">Fecha Fin</th>
                                <th class="text-left">Salario</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(history, index) in selectedUser.HistorialLaboral" :key="index">
                                <td>{{ history.Cargo || 'N/A' }}</td>
                                <td>{{ history.Departamento || 'N/A' }}</td>
                                <td>{{ formatDate(history.FechaInicio) }}</td>
                                <td>{{ formatDate(history.FechaFin) || 'Actual' }}</td>
                                <td>{{ formatCurrency(history.Salario) }}</td>
                              </tr>
                              <tr v-if="!selectedUser.HistorialLaboral || selectedUser.HistorialLaboral.length === 0">
                                <td colspan="5" class="text-center text-grey-7">No hay historial laboral registrado</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-tab-panel>

                <!-- Seguridad Social -->
                <q-tab-panel name="social">
                  <div class="row q-col-gutter-md">
                    <div class="col-md-6 col-sm-12">
                      <q-card flat bordered>
                        <q-card-section>
                          <div class="text-h6">Seguridad Social</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <div class="info-grid">
                            <div class="info-item">
                              <div class="info-label">EPS</div>
                              <div class="info-value">{{ selectedUser.Eps || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Número de Afiliación</div>
                              <div class="info-value">{{ selectedUser.EpsNumero || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Fondo de Pensiones</div>
                              <div class="info-value">{{ selectedUser.FondoPension || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Número de Afiliación</div>
                              <div class="info-value">{{ selectedUser.FondoPensionNumero || 'N/A' }}</div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-md-6 col-sm-12">
                      <q-card flat bordered>
                        <q-card-section>
                          <div class="text-h6">Riesgos Laborales</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <div class="info-grid">
                            <div class="info-item">
                              <div class="info-label">ARL</div>
                              <div class="info-value">{{ selectedUser.Arl || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Número de Afiliación</div>
                              <div class="info-value">{{ selectedUser.ArlNumero || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Nivel de Riesgo</div>
                              <div class="info-value">{{ selectedUser.NivelRiesgo || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Caja de Compensación</div>
                              <div class="info-value">{{ selectedUser.CajaCompensacion || 'N/A' }}</div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-tab-panel>

                <!-- Documentos -->
                <q-tab-panel name="documents">
                  <div class="row q-col-gutter-md">
                    <div class="col-md-6 col-sm-12">
                      <q-card flat bordered>
                        <q-card-section>
                          <div class="text-h6">Documentos Obligatorios</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <div class="documents-grid">
                            <div class="document-item" v-for="(doc, index) in mandatoryDocuments" :key="index">
                              <div class="document-icon">
                                <q-icon :name="doc.available ? 'check_circle' : 'cancel'" 
                                        :color="doc.available ? 'positive' : 'negative'" 
                                        size="24px" />
                              </div>
                              <div class="document-info">
                                <div class="document-name">{{ doc.name }}</div>
                                <div class="document-date" v-if="doc.date">
                                  {{ formatDate(doc.date) }}
                                </div>
                              </div>
                              <div class="document-actions">
                                <q-btn flat round icon="visibility" color="primary" size="sm" v-if="doc.available" />
                                <q-btn flat round icon="cloud_upload" color="grey" size="sm" v-else />
                              </div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-md-6 col-sm-12">
                      <q-card flat bordered>
                        <q-card-section>
                          <div class="text-h6">Evaluaciones y Sanciones</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <div class="info-grid">
                            <div class="info-item">
                              <div class="info-label">Última Evaluación</div>
                              <div class="info-value">
                                {{ selectedUser.UltimaEvaluacion ? formatDate(selectedUser.UltimaEvaluacion.Fecha) : 'N/A' }}
                                <q-badge v-if="selectedUser.UltimaEvaluacion" 
                                         :color="getEvaluationColor(selectedUser.UltimaEvaluacion.Calificacion)"
                                         class="q-ml-sm">
                                  {{ selectedUser.UltimaEvaluacion.Calificacion || 'N/A' }}
                                </q-badge>
                              </div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Sanciones</div>
                              <div class="info-value">
                                {{ selectedUser.Sanciones ? selectedUser.Sanciones.length : '0' }}
                                <q-badge color="negative" class="q-ml-sm" v-if="selectedUser.Sanciones && selectedUser.Sanciones.length > 0">
                                  {{ selectedUser.Sanciones.length }}
                                </q-badge>
                              </div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Capacitaciones</div>
                              <div class="info-value">
                                {{ selectedUser.Capacitaciones ? selectedUser.Capacitaciones.length : '0' }}
                              </div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Último Periodo Vacacional</div>
                              <div class="info-value">
                                {{ selectedUser.UltimoPeriodoVacacional ? formatDate(selectedUser.UltimoPeriodoVacacional) : 'N/A' }}
                              </div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>

                      <q-card flat bordered class="q-mt-md">
                        <q-card-section>
                          <div class="text-h6">Ausentismo</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <div v-if="selectedUser.Ausentismo && selectedUser.Ausentismo.length > 0">
                            <q-markup-table flat bordered>
                              <thead>
                                <tr>
                                  <th class="text-left">Tipo</th>
                                  <th class="text-left">Fecha Inicio</th>
                                  <th class="text-left">Fecha Fin</th>
                                  <th class="text-left">Días</th>
                                  <th class="text-left">Justificación</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(absence, index) in selectedUser.Ausentismo" :key="index">
                                  <td>{{ absence.Tipo || 'N/A' }}</td>
                                  <td>{{ formatDate(absence.FechaInicio) }}</td>
                                  <td>{{ formatDate(absence.FechaFin) }}</td>
                                  <td>{{ absence.Dias || 'N/A' }}</td>
                                  <td>
                                    <q-icon :name="absence.Justificado ? 'check' : 'close'" 
                                            :color="absence.Justificado ? 'positive' : 'negative'" />
                                  </td>
                                </tr>
                              </tbody>
                            </q-markup-table>
                          </div>
                          <div v-else class="text-center text-grey-7 q-pa-md">
                            No hay registros de ausentismo
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-tab-panel>

                <!-- Contacto de Emergencia -->
                <q-tab-panel name="emergency">
                  <div class="row q-col-gutter-md">
                    <div class="col-md-6 col-sm-12">
                      <q-card flat bordered>
                        <q-card-section>
                          <div class="text-h6">Contacto Principal</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <div class="info-grid">
                            <div class="info-item">
                              <div class="info-label">Nombre Completo</div>
                              <div class="info-value">{{ selectedUser.ContactoEmergenciaNombre || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Parentesco</div>
                              <div class="info-value">{{ selectedUser.ContactoEmergenciaParentesco || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Teléfono</div>
                              <div class="info-value">
                                <a v-if="selectedUser.ContactoEmergenciaTelefono" 
                                   :href="'tel:' + selectedUser.ContactoEmergenciaTelefono">
                                  {{ selectedUser.ContactoEmergenciaTelefono }}
                                </a>
                                <span v-else>N/A</span>
                              </div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Dirección</div>
                              <div class="info-value">{{ selectedUser.ContactoEmergenciaDireccion || 'N/A' }}</div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-md-6 col-sm-12">
                      <q-card flat bordered>
                        <q-card-section>
                          <div class="text-h6">Contacto Secundario</div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section>
                          <div class="info-grid">
                            <div class="info-item">
                              <div class="info-label">Nombre Completo</div>
                              <div class="info-value">{{ selectedUser.ContactoEmergenciaSecundarioNombre || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Parentesco</div>
                              <div class="info-value">{{ selectedUser.ContactoEmergenciaSecundarioParentesco || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Teléfono</div>
                              <div class="info-value">
                                <a v-if="selectedUser.ContactoEmergenciaSecundarioTelefono" 
                                   :href="'tel:' + selectedUser.ContactoEmergenciaSecundarioTelefono">
                                  {{ selectedUser.ContactoEmergenciaSecundarioTelefono }}
                                </a>
                                <span v-else>N/A</span>
                              </div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-2 q-pa-md">
          <q-btn label="Imprimir" icon="print" color="grey-7" @click="printEmployeeInfo" />
          <q-btn label="Editar" icon="edit" color="orange" @click="editEmployee(selectedUser)" />
          <q-btn label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo para nuevo empleado -->
    <q-dialog v-model="showNewEmployeeDialog" persistent maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <div class="text-h6">Agregar Nuevo Empleado</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>
        
        <q-card-section class="scroll" style="max-height: calc(100vh - 100px);">
          <q-form @submit="saveNewEmployee" ref="newEmployeeForm">
            <!-- Pestañas para organizar el formulario -->
            <q-tabs
              v-model="newEmployeeTab"
              dense
              class="text-grey q-mb-md"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="personal" icon="person" label="Datos Personales" />
              <q-tab name="laboral" icon="work" label="Información Laboral" />
              <q-tab name="seguridad" icon="health_and_safety" label="Seguridad Social" />
              <q-tab name="documentos" icon="description" label="Documentos y Otros" />
            </q-tabs>

            <q-separator class="q-mb-md" />

            <q-tab-panels v-model="newEmployeeTab" animated>
              <!-- Datos Personales -->
              <q-tab-panel name="personal">
                <div class="text-h6 q-mb-md">Información Personal</div>
                <div class="row q-col-gutter-md">
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.Identificacion" 
                      label="Identificación *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']" 
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.Nombre" 
                      label="Nombre *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']" 
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.Apellido" 
                      label="Apellido *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']" 
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.Correo" 
                      label="Correo Electrónico *" 
                      type="email" 
                      lazy-rules
                      :rules="[
                        val => !!val || 'Campo requerido', 
                        val => /.+@.+\..+/.test(val) || 'Correo no válido'
                      ]" 
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.Telefono" 
                      label="Teléfono *" 
                      mask="(###) ### - ####" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.FechaNacimiento" 
                      label="Fecha de Nacimiento *" 
                      type="date" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model.number="newEmployee.Edad" 
                      label="Edad *" 
                      type="number" 
                      min="18" 
                      max="100"
                      lazy-rules
                      :rules="[
                        val => !!val || 'Campo requerido',
                        val => val >= 18 || 'Debe ser mayor de edad'
                      ]"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="newEmployee.EstadoCivil" 
                      :options="['Soltero(a)', 'Casado(a)', 'Unión Libre', 'Divorciado(a)', 'Viudo(a)']" 
                      label="Estado Civil *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model.number="newEmployee.Hijos" 
                      label="Número de Hijos *" 
                      type="number" 
                      min="0" 
                      lazy-rules
                      :rules="[val => val >= 0 || 'No puede ser negativo']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="newEmployee.TipoSangre" 
                      :options="['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']" 
                      label="Tipo de Sangre *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.Ciudad" 
                      label="Ciudad *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="newEmployee.Estrato" 
                      :options="['1', '2', '3', '4', '5', '6']" 
                      label="Estrato Socioeconómico *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="newEmployee.Estado" 
                      :options="['Activo', 'Inactivo']" 
                      label="Estado del Empleado *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                </div>
              </q-tab-panel>

              <!-- Información Laboral -->
              <q-tab-panel name="laboral">
                <div class="text-h6 q-mb-md">Información Laboral</div>
                <div class="row q-col-gutter-md">
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="newEmployee.Cargo" 
                      :options="jobPositions" 
                      label="Cargo *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model.number="newEmployee.Sueldo" 
                      label="Salario *" 
                      prefix="$" 
                      type="number" 
                      lazy-rules
                      :rules="[
                        val => !!val || 'Campo requerido',
                        val => val > 0 || 'Debe ser mayor a 0'
                      ]"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="newEmployee.TipoContrato" 
                      :options="contractTypeOptions" 
                      label="Tipo de Contrato *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.FechaInicioContrato" 
                      label="Fecha Inicio Contrato *" 
                      type="date" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.FechaFinContrato" 
                      label="Fecha Fin Contrato *" 
                      type="date" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.FechaIngresoEmpresa" 
                      label="Fecha de Ingreso a la Empresa *" 
                      type="date" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="newEmployee.Sede" 
                      :options="['Villanueva', 'Santa Marta', 'Barranquilla', 'Floridablanca']" 
                      label="Sede *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.UltimoPeriodoVacacional" 
                      label="Último Período Vacacional *" 
                      type="date" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="newEmployee.EvaluacionDesempeño" 
                      :options="['Excelente', 'Bueno', 'Satisfactorio', 'Necesita Mejora', 'Deficiente']" 
                      label="Evaluación de Desempeño *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-12">
                    <q-input 
                      outlined 
                      v-model="newEmployee.PerfilProfesional" 
                      label="Perfil Profesional *" 
                      type="textarea" 
                      rows="3" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                </div>
              </q-tab-panel>

              <!-- Seguridad Social -->
              <q-tab-panel name="seguridad">
                <div class="text-h6 q-mb-md">Seguridad Social</div>
                <div class="row q-col-gutter-md">
                  <div class="col-md-6 col-sm-12">
                    <q-card flat bordered class="q-pa-md">
                      <div class="text-subtitle1 q-mb-md">Afiliaciones de Salud</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12">
                          <q-input 
                            outlined 
                            v-model="newEmployee.Eps" 
                            label="EPS *" 
                            lazy-rules
                            :rules="[val => !!val || 'Campo requerido']"
                          />
                        </div>
                        <div class="col-12">
                          <q-input 
                            outlined 
                            v-model="newEmployee.FondoPension" 
                            label="Fondo de Pensiones *" 
                            lazy-rules
                            :rules="[val => !!val || 'Campo requerido']"
                          />
                        </div>
                      </div>
                    </q-card>
                  </div>
                  <div class="col-md-6 col-sm-12">
                    <q-card flat bordered class="q-pa-md">
                      <div class="text-subtitle1 q-mb-md">Riesgos y Compensación</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12">
                          <q-input 
                            outlined 
                            v-model="newEmployee.Arl" 
                            label="ARL *" 
                            lazy-rules
                            :rules="[val => !!val || 'Campo requerido']"
                          />
                        </div>
                        <div class="col-12">
                          <q-input 
                            outlined 
                            v-model="newEmployee.CajaCompensacion" 
                            label="Caja de Compensación *" 
                            lazy-rules
                            :rules="[val => !!val || 'Campo requerido']"
                          />
                        </div>
                      </div>
                    </q-card>
                  </div>
                </div>
              </q-tab-panel>

              <!-- Documentos y Otros -->
              <q-tab-panel name="documentos">
                <div class="text-h6 q-mb-md">Documentos y Otros Datos</div>
                
                <!-- Subida de documentos con Cloudinary -->
                <div class="q-mb-lg">
                  <div class="text-subtitle1 q-mb-md text-grey-7">
                    <q-icon name="cloud_upload" class="q-mr-sm" />
                    Documentos del Empleado
                  </div>
                  
                  <div class="row q-col-gutter-md">
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="newEmployee.CertificadoEstudio"
                        label="Certificado de Estudios"
                        hint="Sube el certificado de estudios (PDF, JPG, PNG)"
                        folder="employee-documents/certificates"
                        accepted-types=".pdf,.jpg,.jpeg,.png"
                        @file-uploaded="onFileUploaded('CertificadoEstudio', $event)"
                        @file-removed="onFileRemoved('CertificadoEstudio')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="newEmployee.CopiaContrato"
                        label="Copia del Contrato"
                        hint="Sube la copia del contrato laboral (PDF, DOC, DOCX)"
                        folder="employee-documents/contracts"
                        accepted-types=".pdf,.doc,.docx"
                        @file-uploaded="onFileUploaded('CopiaContrato', $event)"
                        @file-removed="onFileRemoved('CopiaContrato')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="newEmployee.ControlAusentismo"
                        label="Control de Ausentismo"
                        hint="Documentos relacionados con control de ausentismo"
                        folder="employee-documents/attendance"
                        @file-uploaded="onFileUploaded('ControlAusentismo', $event)"
                        @file-removed="onFileRemoved('ControlAusentismo')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="newEmployee.Sanciones"
                        label="Registro de Sanciones"
                        hint="Documentos de sanciones disciplinarias (si aplica)"
                        folder="employee-documents/sanctions"
                        @file-uploaded="onFileUploaded('Sanciones', $event)"
                        @file-removed="onFileRemoved('Sanciones')"
                      />
                    </div>
                  </div>
                </div>

                <!-- Documentos adicionales opcionales -->
                <div class="q-mb-lg">
                  <div class="text-subtitle1 q-mb-md text-grey-7">
                    <q-icon name="folder_shared" class="q-mr-sm" />
                    Documentos Adicionales (Opcionales)
                  </div>
                  
                  <div class="row q-col-gutter-md">
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="newEmployee.HojaDeVida"
                        label="Hoja de Vida"
                        hint="Curriculum vitae actualizado (PDF recomendado)"
                        folder="employee-documents/resumes"
                        accepted-types=".pdf,.doc,.docx"
                        @file-uploaded="onFileUploaded('HojaDeVida', $event)"
                        @file-removed="onFileRemoved('HojaDeVida')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="newEmployee.FotocopiaCedula"
                        label="Fotocopia de Cédula"
                        hint="Documento de identidad escaneado"
                        folder="employee-documents/identification"
                        accepted-types=".pdf,.jpg,.jpeg,.png"
                        @file-uploaded="onFileUploaded('FotocopiaCedula', $event)"
                        @file-removed="onFileRemoved('FotocopiaCedula')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="newEmployee.CertificadoEps"
                        label="Certificado EPS"
                        hint="Certificado de afiliación a EPS"
                        folder="employee-documents/health"
                        @file-uploaded="onFileUploaded('CertificadoEps', $event)"
                        @file-removed="onFileRemoved('CertificadoEps')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="newEmployee.CertificadoAntecedentes"
                        label="Certificado de Antecedentes"
                        hint="Certificado judicial de antecedentes"
                        folder="employee-documents/background-check"
                        @file-uploaded="onFileUploaded('CertificadoAntecedentes', $event)"
                        @file-removed="onFileRemoved('CertificadoAntecedentes')"
                      />
                    </div>
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-form>
        </q-card-section>
        
        <q-card-actions align="right" class="bg-grey-2 q-pa-md">
          <q-btn 
            flat 
            label="Cancelar" 
            color="negative" 
            @click="cancelNewEmployee" 
          />
          <q-btn 
            label="Guardar Empleado" 
            color="positive" 
            @click="saveNewEmployee" 
            icon="save"
            :loading="loading"
            :disable="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo para editar empleado -->
    <q-dialog v-model="showEditEmployeeDialog" persistent maximized>
      <q-card>
        <q-bar class="bg-orange text-white">
          <div class="text-h6">Editar Empleado</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>
        
        <q-card-section class="scroll" style="max-height: calc(100vh - 100px);">
          <q-form @submit="updateEmployee" ref="editEmployeeForm">
            <!-- Pestañas para organizar el formulario -->
            <q-tabs
              v-model="editEmployeeTab"
              dense
              class="text-grey q-mb-md"
              active-color="orange"
              indicator-color="orange"
              align="justify"
              narrow-indicator
            >
              <q-tab name="personal" icon="person" label="Datos Personales" />
              <q-tab name="laboral" icon="work" label="Información Laboral" />
              <q-tab name="seguridad" icon="health_and_safety" label="Seguridad Social" />
              <q-tab name="documentos" icon="description" label="Documentos y Otros" />
            </q-tabs>

            <q-separator class="q-mb-md" />

            <q-tab-panels v-model="editEmployeeTab" animated>
              <!-- Datos Personales -->
              <q-tab-panel name="personal">
                <div class="text-h6 q-mb-md">Información Personal</div>
                <div class="row q-col-gutter-md">
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.Identificacion" 
                      label="Identificación *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']" 
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.Nombre" 
                      label="Nombre *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']" 
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.Apellido" 
                      label="Apellido *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']" 
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.Correo" 
                      label="Correo Electrónico *" 
                      type="email" 
                      lazy-rules
                      :rules="[
                        val => !!val || 'Campo requerido', 
                        val => /.+@.+\..+/.test(val) || 'Correo no válido'
                      ]" 
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.Telefono" 
                      label="Teléfono *" 
                      mask="(###) ### - ####" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.FechaNacimiento" 
                      label="Fecha de Nacimiento *" 
                      type="date" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model.number="editEmployeeData.Edad" 
                      label="Edad *" 
                      type="number" 
                      min="18" 
                      max="100"
                      lazy-rules
                      :rules="[
                        val => !!val || 'Campo requerido',
                        val => val >= 18 || 'Debe ser mayor de edad'
                      ]"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="editEmployeeData.EstadoCivil" 
                      :options="['Soltero(a)', 'Casado(a)', 'Unión Libre', 'Divorciado(a)', 'Viudo(a)']" 
                      label="Estado Civil *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model.number="editEmployeeData.Hijos" 
                      label="Número de Hijos *" 
                      type="number" 
                      min="0" 
                      lazy-rules
                      :rules="[val => val >= 0 || 'No puede ser negativo']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="editEmployeeData.TipoSangre" 
                      :options="['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']" 
                      label="Tipo de Sangre *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.Ciudad" 
                      label="Ciudad *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="editEmployeeData.Estrato" 
                      :options="['1', '2', '3', '4', '5', '6']" 
                      label="Estrato Socioeconómico *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="editEmployeeData.Estado" 
                      :options="['Activo', 'Inactivo']" 
                      label="Estado del Empleado *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                </div>
              </q-tab-panel>

              <!-- Información Laboral -->
              <q-tab-panel name="laboral">
                <div class="text-h6 q-mb-md">Información Laboral</div>
                <div class="row q-col-gutter-md">
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="editEmployeeData.Cargo" 
                      :options="jobPositions" 
                      label="Cargo *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model.number="editEmployeeData.Sueldo" 
                      label="Salario *" 
                      prefix="$" 
                      type="number" 
                      lazy-rules
                      :rules="[
                        val => !!val || 'Campo requerido',
                        val => val > 0 || 'Debe ser mayor a 0'
                      ]"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="editEmployeeData.TipoContrato" 
                      :options="contractTypeOptions" 
                      label="Tipo de Contrato *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.FechaInicioContrato" 
                      label="Fecha Inicio Contrato *" 
                      type="date" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.FechaFinContrato" 
                      label="Fecha Fin Contrato *" 
                      type="date" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.FechaIngresoEmpresa" 
                      label="Fecha de Ingreso a la Empresa *" 
                      type="date" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="editEmployeeData.Sede" 
                      :options="['Villanueva', 'Santa Marta', 'Barranquilla', 'Floridablanca']" 
                      label="Sede *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.UltimoPeriodoVacacional" 
                      label="Último Período Vacacional *" 
                      type="date" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12">
                    <q-select 
                      outlined 
                      v-model="editEmployeeData.EvaluacionDesempeño" 
                      :options="['Excelente', 'Bueno', 'Satisfactorio', 'Necesita Mejora', 'Deficiente']" 
                      label="Evaluación de Desempeño *" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-12">
                    <q-input 
                      outlined 
                      v-model="editEmployeeData.PerfilProfesional" 
                      label="Perfil Profesional *" 
                      type="textarea" 
                      rows="3" 
                      lazy-rules
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                </div>
              </q-tab-panel>

              <!-- Seguridad Social -->
              <q-tab-panel name="seguridad">
                <div class="text-h6 q-mb-md">Seguridad Social</div>
                <div class="row q-col-gutter-md">
                  <div class="col-md-6 col-sm-12">
                    <q-card flat bordered class="q-pa-md">
                      <div class="text-subtitle1 q-mb-md">Afiliaciones de Salud</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12">
                          <q-input 
                            outlined 
                            v-model="editEmployeeData.Eps" 
                            label="EPS *" 
                            lazy-rules
                            :rules="[val => !!val || 'Campo requerido']"
                          />
                        </div>
                        <div class="col-12">
                          <q-input 
                            outlined 
                            v-model="editEmployeeData.FondoPension" 
                            label="Fondo de Pensiones *" 
                            lazy-rules
                            :rules="[val => !!val || 'Campo requerido']"
                          />
                        </div>
                      </div>
                    </q-card>
                  </div>
                  <div class="col-md-6 col-sm-12">
                    <q-card flat bordered class="q-pa-md">
                      <div class="text-subtitle1 q-mb-md">Riesgos y Compensación</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12">
                          <q-input 
                            outlined 
                            v-model="editEmployeeData.Arl" 
                            label="ARL *" 
                            lazy-rules
                            :rules="[val => !!val || 'Campo requerido']"
                          />
                        </div>
                        <div class="col-12">
                          <q-input 
                            outlined 
                            v-model="editEmployeeData.CajaCompensacion" 
                            label="Caja de Compensación *" 
                            lazy-rules
                            :rules="[val => !!val || 'Campo requerido']"
                          />
                        </div>
                      </div>
                    </q-card>
                  </div>
                </div>
              </q-tab-panel>

              <!-- Documentos y Otros -->
              <q-tab-panel name="documentos">
                <div class="text-h6 q-mb-md">Documentos y Otros Datos</div>
                
                <!-- Subida de documentos con Cloudinary -->
                <div class="q-mb-lg">
                  <div class="text-subtitle1 q-mb-md text-grey-7">
                    <q-icon name="cloud_upload" class="q-mr-sm" />
                    Documentos del Empleado
                  </div>
                  
                  <div class="row q-col-gutter-md">
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="editEmployeeData.CertificadoEstudio"
                        label="Certificado de Estudios"
                        hint="Sube el certificado de estudios (PDF, JPG, PNG)"
                        folder="employee-documents/certificates"
                        accepted-types=".pdf,.jpg,.jpeg,.png"
                        @file-uploaded="onFileUploaded('CertificadoEstudio', $event)"
                        @file-removed="onFileRemoved('CertificadoEstudio')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="editEmployeeData.CopiaContrato"
                        label="Copia del Contrato"
                        hint="Sube la copia del contrato laboral (PDF, DOC, DOCX)"
                        folder="employee-documents/contracts"
                        accepted-types=".pdf,.doc,.docx"
                        @file-uploaded="onFileUploaded('CopiaContrato', $event)"
                        @file-removed="onFileRemoved('CopiaContrato')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="editEmployeeData.ControlAusentismo"
                        label="Control de Ausentismo"
                        hint="Documentos relacionados con control de ausentismo"
                        folder="employee-documents/attendance"
                        @file-uploaded="onFileUploaded('ControlAusentismo', $event)"
                        @file-removed="onFileRemoved('ControlAusentismo')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="editEmployeeData.Sanciones"
                        label="Registro de Sanciones"
                        hint="Documentos de sanciones disciplinarias (si aplica)"
                        folder="employee-documents/sanctions"
                        @file-uploaded="onFileUploaded('Sanciones', $event)"
                        @file-removed="onFileRemoved('Sanciones')"
                      />
                    </div>
                  </div>
                </div>

                <!-- Documentos adicionales opcionales -->
                <div class="q-mb-lg">
                  <div class="text-subtitle1 q-mb-md text-grey-7">
                    <q-icon name="folder_shared" class="q-mr-sm" />
                    Documentos Adicionales (Opcionales)
                  </div>
                  
                  <div class="row q-col-gutter-md">
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="editEmployeeData.HojaDeVida"
                        label="Hoja de Vida"
                        hint="Curriculum vitae actualizado (PDF recomendado)"
                        folder="employee-documents/resumes"
                        accepted-types=".pdf,.doc,.docx"
                        @file-uploaded="onFileUploaded('HojaDeVida', $event)"
                        @file-removed="onFileRemoved('HojaDeVida')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="editEmployeeData.FotocopiaCedula"
                        label="Fotocopia de Cédula"
                        hint="Documento de identidad escaneado"
                        folder="employee-documents/identification"
                        accepted-types=".pdf,.jpg,.jpeg,.png"
                        @file-uploaded="onFileUploaded('FotocopiaCedula', $event)"
                        @file-removed="onFileRemoved('FotocopiaCedula')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="editEmployeeData.CertificadoEps"
                        label="Certificado EPS"
                        hint="Certificado de afiliación a EPS"
                        folder="employee-documents/health"
                        @file-uploaded="onFileUploaded('CertificadoEps', $event)"
                        @file-removed="onFileRemoved('CertificadoEps')"
                      />
                    </div>
                    <div class="col-md-6 col-sm-12">
                      <FileUpload
                        v-model="editEmployeeData.CertificadoAntecedentes"
                        label="Certificado de Antecedentes"
                        hint="Certificado judicial de antecedentes"
                        folder="employee-documents/background-check"
                        @file-uploaded="onFileUploaded('CertificadoAntecedentes', $event)"
                        @file-removed="onFileRemoved('CertificadoAntecedentes')"
                      />
                    </div>
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-form>
        </q-card-section>
        
        <q-card-actions align="right" class="bg-grey-2 q-pa-md">
          <q-btn 
            flat 
            label="Cancelar" 
            color="negative" 
            @click="cancelEditEmployee" 
          />
          <q-btn 
            label="Actualizar Empleado" 
            color="orange" 
            @click="updateEmployee" 
            icon="update"
            :loading="loading"
            :disable="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { getData, postData, putData } from '../services/apiClient.js';
import FileUpload from '../components/FileUpload.vue';

const $q = useQuasar();

// Configuración de la tabla
const columns = [
  {
    name: 'Identificacion',
    required: true,
    label: 'ID',
    align: 'left',
    field: 'Identificacion',
    sortable: true
  },
  {
    name: 'nombre',
    label: 'Nombre Completo',
    align: 'left',
    field: row => `${row.Nombre} ${row.Apellido}`,
    sortable: true
  },
  {
    name: 'Cargo',
    label: 'Cargo',
    align: 'left',
    field: 'Cargo',
    sortable: true
  },
  {
    name: 'Departamento',
    label: 'Departamento',
    align: 'left',
    field: 'Departamento',
    sortable: true
  },
  {
    name: 'Sueldo',
    label: 'Salario',
    align: 'right',
    field: 'Sueldo',
    format: val => formatCurrency(val),
    sortable: true
  },
  {
    name: 'TipoContrato',
    label: 'Tipo Contrato',
    align: 'left',
    field: 'TipoContrato',
    sortable: true
  },
  {
    name: 'status',
    label: 'Estado',
    align: 'center',
    field: 'Estado',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center',
    field: 'actions',
    sortable: false
  }
];

// Variables reactivas
const loading = ref(false);
const allUsers = ref([]);
const filteredEmployees = ref([]);
const selectedUser = ref(null);
const showModal = ref(false);
const currentTab = ref('personal');
const pagination = ref({
  sortBy: 'nombre',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

// Paginación específica para móviles
const mobilePagination = ref({
  page: 1,
  rowsPerPage: 8
});
const searchTerm = ref('');
const departmentFilter = ref(null);
const contractTypeFilter = ref(null);
const currentSede = ref('Villanueva'); // Sede activa por defecto
const showNewEmployeeDialog = ref(false);
const newEmployeeTab = ref('personal');
const showEditEmployeeDialog = ref(false);
const editEmployeeTab = ref('personal');
const editEmployeeData = ref({});

const newEmployee = ref({
  // Datos Personales Requeridos
  Identificacion: '',
  Nombre: '',
  Apellido: '',
  Correo: '',
  Telefono: '',
  FechaNacimiento: '',
  Edad: null,
  Hijos: 0,
  EstadoCivil: '',
  TipoSangre: '',
  Ciudad: '',
  Estrato: '',
  Estado: 1, // Por defecto activo (número)
  
  // Datos Laborales Requeridos
  Cargo: '',
  Sueldo: 0,
  TipoContrato: '',
  FechaInicioContrato: '',
  FechaFinContrato: '',
  FechaIngresoEmpresa: '',
  Sede: 'Villanueva', // Sede por defecto
  PerfilProfesional: '',
  UltimoPeriodoVacacional: '',
  EvaluacionDesempeño: '',
  
  // Seguridad Social Requeridos
  Eps: '',
  Arl: '',
  CajaCompensacion: '',
  FondoPension: '',
  
  // Campos Opcionales
  CertificadoEstudio: '',
  CopiaContrato: '',
  ControlAusentismo: '',
  Sanciones: ''
});

// Opciones para filtros
const departmentOptions = ref(['Administración', 'TI', 'Recursos Humanos', 'Ventas', 'Marketing', 'Producción']);
const contractTypeOptions = ref(['Término Fijo', 'Término Indefinido', 'Prestación de Servicios', 'Aprendizaje', 'Obra o Labor']);
const jobPositions = ref([
  'Desarrollador', 'Diseñador', 'Gerente', 'Analista', 'Asistente', 'Director',
  'Coordinador', 'Supervisor', 'Técnico', 'Especialista', 'Consultor', 'Operario',
  'Administrativo', 'Vendedor', 'Contador', 'Abogado', 'Médico', 'Enfermero'
]);

// Documentos obligatorios (ejemplo)
const mandatoryDocuments = ref([
  { name: 'Hoja de Vida', field: 'HojaDeVida', available: false, date: null },
  { name: 'Certificado de Estudios', field: 'CertificadoEstudio', available: false, date: null },
  { name: 'Copia de Contrato', field: 'CopiaContrato', available: false, date: null },
  { name: 'Fotocopia de Cédula', field: 'FotocopiaCedula', available: false, date: null },
  { name: 'Certificado EPS', field: 'CertificadoEps', available: false, date: null },
  { name: 'Certificado de Antecedentes', field: 'CertificadoAntecedentes', available: false, date: null }
]);

// Funciones computadas
const totalEmployees = computed(() => allUsers.value.length);
const activeEmployees = computed(() => allUsers.value.filter(user => user.Estado === 1 || user.Estado === '1').length);

// Filtrados por sede
const filteredBySede = computed(() => {
  return allUsers.value.filter(user => user.Sede === currentSede.value);
});

const activeBySede = computed(() => {
  return filteredBySede.value.filter(user => user.Estado === 1 || user.Estado === '1').length;
});

// Propiedades computadas para la vista móvil
const paginatedEmployeesMobile = computed(() => {
  const start = (mobilePagination.value.page - 1) * mobilePagination.value.rowsPerPage;
  const end = start + mobilePagination.value.rowsPerPage;
  return filteredEmployees.value.slice(start, end);
});

// Funciones
function formatCurrency(amount) {
  if (!amount) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getInitials(firstName, lastName) {
  if (!firstName || !lastName) return '?';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getStatusColor(status) {
  // Convertir número a string para comparación consistente
  const statusStr = String(status);
  if (statusStr === '1' || status === 'Activo') return 'positive';
  if (statusStr === '0' || status === 'Inactivo') return 'negative';
  if (status === 'Vacaciones') return 'warning';
  if (status === 'Licencia') return 'info';
  return 'grey';
}

function getStatusText(status) {
  // Función auxiliar para convertir número a texto
  if (status === 1 || status === '1') return 'Activo';
  if (status === 0 || status === '0') return 'Inactivo';
  return status || 'Activo';
}

function getEvaluationColor(score) {
  if (!score) return 'grey';
  if (score >= 90) return 'positive';
  if (score >= 70) return 'warning';
  return 'negative';
}

function viewUserDetails(user) {
  selectedUser.value = user;
  
  // Actualizar estado de documentos
  mandatoryDocuments.value.forEach(doc => {
    doc.available = !!selectedUser.value[doc.field];
    doc.date = selectedUser.value[`${doc.field}Fecha`];
  });
  
  showModal.value = true;
  currentTab.value = 'personal';
}

function editEmployee(user) {
  selectedUser.value = user;
  // Cerrar el modal de detalles si está abierto
  showModal.value = false;
  
  // Copiar todos los datos del usuario al objeto de edición
  editEmployeeData.value = {
    ...user,
    // Convertir estado numérico a texto para el formulario
    Estado: (user.Estado === 1 || user.Estado === '1') ? 'Activo' : 'Inactivo',
    // Asegurar que las fechas estén en el formato correcto para los inputs
    FechaNacimiento: user.FechaNacimiento ? new Date(user.FechaNacimiento).toISOString().split('T')[0] : '',
    FechaInicioContrato: user.FechaInicioContrato ? new Date(user.FechaInicioContrato).toISOString().split('T')[0] : '',
    FechaFinContrato: user.FechaFinContrato ? new Date(user.FechaFinContrato).toISOString().split('T')[0] : '',
    FechaIngresoEmpresa: user.FechaIngresoEmpresa ? new Date(user.FechaIngresoEmpresa).toISOString().split('T')[0] : '',
    UltimoPeriodoVacacional: user.UltimoPeriodoVacacional ? new Date(user.UltimoPeriodoVacacional).toISOString().split('T')[0] : ''
  };
  
  // Abrir el diálogo de edición
  showEditEmployeeDialog.value = true;
  editEmployeeTab.value = 'personal';
}

function cancelEditEmployee() {
  showEditEmployeeDialog.value = false;
  editEmployeeData.value = {};
}

async function updateEmployee() {
  loading.value = true;
  
  // Validar campos requeridos según el modelo de MongoDB
  const requiredFields = [
    'Identificacion', 'Nombre', 'Apellido', 'Correo', 'Telefono', 
    'FechaNacimiento', 'Eps', 'Arl', 'Estrato', 'Edad', 'Hijos',
    'EstadoCivil', 'TipoSangre', 'TipoContrato', 'FechaInicioContrato',
    'FechaFinContrato', 'CajaCompensacion', 'FondoPension', 'PerfilProfesional',
    'UltimoPeriodoVacacional', 'EvaluacionDesempeño', 'Cargo', 'Sueldo',
    'FechaIngresoEmpresa', 'Ciudad', 'Sede', 'Estado'
  ];
  
  const missingFields = requiredFields.filter(field => {
    const value = editEmployeeData.value[field];
    return !value || value === '' || value === null || (field === 'Sueldo' ? value <= 0 : false);
  });
  
  if (missingFields.length > 0) {
    $q.notify({
      message: `Por favor complete los campos requeridos: ${missingFields.join(', ')}`,
      color: 'negative',
      timeout: 5000
    });
    loading.value = false;
    return;
  }
  
  // Validar formato de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmployeeData.value.Correo)) {
    $q.notify({
      message: 'Por favor ingrese un correo electrónico válido',
      color: 'negative'
    });
    loading.value = false;
    return;
  }
  
  // Validar que la edad sea razonable
  if (editEmployeeData.value.Edad < 18 || editEmployeeData.value.Edad > 100) {
    $q.notify({
      message: 'La edad debe estar entre 18 y 100 años',
      color: 'negative'
    });
    loading.value = false;
    return;
  }
  
  // Preparar datos para enviar (asegurar tipos correctos)
  const updatedEmployeeData = {
    ...editEmployeeData.value,
    Identificacion: String(editEmployeeData.value.Identificacion),
    Nombre: String(editEmployeeData.value.Nombre),
    Apellido: String(editEmployeeData.value.Apellido),
    Correo: String(editEmployeeData.value.Correo),
    Telefono: String(editEmployeeData.value.Telefono),
    Eps: String(editEmployeeData.value.Eps),
    Arl: String(editEmployeeData.value.Arl),
    Estrato: String(editEmployeeData.value.Estrato),
    Edad: Number(editEmployeeData.value.Edad),
    Hijos: Number(editEmployeeData.value.Hijos),
    EstadoCivil: String(editEmployeeData.value.EstadoCivil),
    TipoSangre: String(editEmployeeData.value.TipoSangre),
    TipoContrato: String(editEmployeeData.value.TipoContrato),
    CajaCompensacion: String(editEmployeeData.value.CajaCompensacion),
    FondoPension: String(editEmployeeData.value.FondoPension),
    PerfilProfesional: String(editEmployeeData.value.PerfilProfesional),
    EvaluacionDesempeño: String(editEmployeeData.value.EvaluacionDesempeño),
    Cargo: String(editEmployeeData.value.Cargo),
    Sueldo: Number(editEmployeeData.value.Sueldo),
    Ciudad: String(editEmployeeData.value.Ciudad),
    Sede: String(editEmployeeData.value.Sede),
    Estado: editEmployeeData.value.Estado === 'Activo' ? 1 : 0, // Convertir a número
    // Campos opcionales
    CertificadoEstudio: String(editEmployeeData.value.CertificadoEstudio || ''),
    CopiaContrato: String(editEmployeeData.value.CopiaContrato || ''),
    ControlAusentismo: String(editEmployeeData.value.ControlAusentismo || ''),
    Sanciones: String(editEmployeeData.value.Sanciones || '')
  };

  try {
    // Usar el ID del documento para la actualización
    const employeeId = editEmployeeData.value._id || editEmployeeData.value.id;
    const response = await putData(`User/${employeeId}`, updatedEmployeeData);
    console.log('Empleado actualizado:', response);

    showEditEmployeeDialog.value = false;
    $q.notify({
      message: 'Empleado actualizado exitosamente',
      color: 'positive'
    });
    
    // Recargar la lista de empleados para mostrar los cambios
    await getDataFromApi();
    
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    $q.notify({
      message: 'Error al actualizar empleado. Por favor intente nuevamente.',
      color: 'negative'
    });
  } finally {
    loading.value = false;
  }
}

function toggleEmployeeStatus(user) {
  const currentStatus = user.Estado;
  const isActive = currentStatus === 1 || currentStatus === '1';
  const newStatusText = isActive ? 'desactivar' : 'activar';
  const newStatus = isActive ? 0 : 1;
  
  $q.dialog({
    title: 'Confirmar',
    message: `¿Estás seguro de ${newStatusText} a ${user.Nombre} ${user.Apellido}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      loading.value = true;
      
      // Usar el endpoint estándar de actualización con el nuevo estado
      const updatedData = {
        ...user,
        Estado: newStatus
      };
      
      await putData(`User/${user._id}`, updatedData);
      
      // Actualizar el estado local
      user.Estado = newStatus;
      
      $q.notify({
        message: `Estado cambiado a ${getStatusText(user.Estado)}`,
        color: 'positive'
      });
      
      // Recargar los datos para asegurar consistencia
      await getDataFromApi();
      
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      $q.notify({
        message: 'Error al cambiar el estado del empleado. Verifique la conexión con el servidor.',
        color: 'negative'
      });
    } finally {
      loading.value = false;
    }
  });
}

function filterBySede() {
  // Cuando cambie la sede, aplicar todos los filtros incluyendo la sede
  filterEmployees();
}

function filterEmployees() {
  if (!allUsers.value.length) return;
  
  // Primero filtrar por sede
  let filtered = allUsers.value.filter(user => user.Sede === currentSede.value);
  
  // Filtrar por término de búsqueda
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(user => 
      (user.Nombre && user.Nombre.toLowerCase().includes(term)) ||
      (user.Apellido && user.Apellido.toLowerCase().includes(term)) ||
      (user.Identificacion && user.Identificacion.toLowerCase().includes(term)) ||
      (user.Cargo && user.Cargo.toLowerCase().includes(term))
    );
  }
  
  // Filtrar por departamento
  if (departmentFilter.value) {
    filtered = filtered.filter(user => 
      user.Departamento && user.Departamento === departmentFilter.value
    );
  }
  
  // Filtrar por tipo de contrato
  if (contractTypeFilter.value) {
    filtered = filtered.filter(user => 
      user.TipoContrato && user.TipoContrato === contractTypeFilter.value
    );
  }
  
  filteredEmployees.value = filtered;
  pagination.value.rowsNumber = filtered.length;
}

function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  
  // Ordenar datos
  let sorted = [...filteredEmployees.value];
  if (sortBy) {
    sorted.sort((a, b) => {
      const x = a[sortBy] || '';
      const y = b[sortBy] || '';
      return descending 
        ? (x < y ? 1 : x > y ? -1 : 0)
        : (x < y ? -1 : x > y ? 1 : 0);
    });
  }
  
  // Paginar
  const startRow = (page - 1) * rowsPerPage;
  const endRow = startRow + rowsPerPage;
  filteredEmployees.value = sorted.slice(startRow, endRow);
  
  // Actualizar paginación
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
}

// Funciones para la vista móvil
function updateMobilePagination(page) {
  mobilePagination.value.page = page;
}

function getMobilePageInfo() {
  const start = (mobilePagination.value.page - 1) * mobilePagination.value.rowsPerPage + 1;
  const end = Math.min(
    mobilePagination.value.page * mobilePagination.value.rowsPerPage,
    filteredEmployees.value.length
  );
  return `${start}-${end} de ${filteredEmployees.value.length}`;
}

function printEmployeeInfo() {
  if (!selectedUser.value) {
    $q.notify({
      message: 'No hay empleado seleccionado para imprimir',
      color: 'warning'
    });
    return;
  }

  $q.notify({
    message: 'Documento preparado para impresión',
    color: 'positive',
    icon: 'print'
  });
}

// Manejadores de archivos
function onFileUploaded(fieldName, fileData) {
  console.log(`Archivo subido para ${fieldName}:`, fileData);
  
  // Actualizar el campo correspondiente en el formulario activo
  if (showNewEmployeeDialog.value) {
    newEmployee.value[fieldName] = fileData.url;
  } else if (showEditEmployeeDialog.value) {
    editEmployeeData.value[fieldName] = fileData.url;
  }

  // Mostrar notificación de éxito
  $q.notify({
    message: `${getFieldDisplayName(fieldName)} subido exitosamente`,
    color: 'positive',
    icon: 'cloud_upload'
  });
}

function onFileRemoved(fieldName) {
  console.log(`Archivo eliminado del campo: ${fieldName}`);
  
  // Limpiar el campo correspondiente en el formulario activo
  if (showNewEmployeeDialog.value) {
    newEmployee.value[fieldName] = '';
  } else if (showEditEmployeeDialog.value) {
    editEmployeeData.value[fieldName] = '';
  }

  $q.notify({
    message: `${getFieldDisplayName(fieldName)} eliminado`,
    color: 'info',
    icon: 'delete'
  });
}

function getFieldDisplayName(fieldName) {
  const fieldNames = {
    'CertificadoEstudio': 'Certificado de Estudios',
    'CopiaContrato': 'Copia del Contrato',
    'ControlAusentismo': 'Control de Ausentismo',
    'Sanciones': 'Registro de Sanciones',
    'HojaDeVida': 'Hoja de Vida',
    'FotocopiaCedula': 'Fotocopia de Cédula',
    'CertificadoEps': 'Certificado EPS',
    'CertificadoAntecedentes': 'Certificado de Antecedentes'
  };
  return fieldNames[fieldName] || fieldName;
}

// Funciones para manejo de documentos
function viewDocument(url, filename) {
  if (!url) {
    $q.notify({
      message: 'URL del documento no disponible',
      color: 'warning'
    });
    return;
  }

  // Abrir en una nueva ventana
  window.open(url, '_blank');
  
  $q.notify({
    message: `Abriendo ${filename}`,
    color: 'info',
    icon: 'visibility'
  });
}

function downloadDocument(url, filename) {
  if (!url) {
    $q.notify({
      message: 'URL del documento no disponible',
      color: 'warning'
    });
    return;
  }

  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'documento';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    $q.notify({
      message: `Descargando ${filename}`,
      color: 'positive',
      icon: 'download'
    });
  } catch (error) {
    console.error('Error al descargar documento:', error);
    $q.notify({
      message: 'Error al descargar el documento',
      color: 'negative'
    });
  }
}

function openNewEmployeeDialog() {
  showNewEmployeeDialog.value = true;
  newEmployeeTab.value = 'personal';
  
  // Resetear formulario
  newEmployee.value = {
    // Datos Personales Requeridos
    Identificacion: '',
    Nombre: '',
    Apellido: '',
    Correo: '',
    Telefono: '',
    FechaNacimiento: '',
    Edad: null,
    Hijos: 0,
    EstadoCivil: '',
    TipoSangre: '',
    Ciudad: '',
    Estrato: '',
    Estado: 1, // Por defecto activo (número)
    
    // Datos Laborales Requeridos
    Cargo: '',
    Sueldo: 0,
    TipoContrato: '',
    FechaInicioContrato: '',
    FechaFinContrato: '',
    FechaIngresoEmpresa: '',
    Sede: currentSede.value, // Usar la sede actual como valor por defecto
    PerfilProfesional: '',
    UltimoPeriodoVacacional: '',
    EvaluacionDesempeño: '',
    
    // Seguridad Social Requeridos
    Eps: '',
    Arl: '',
    CajaCompensacion: '',
    FondoPension: '',
    
    // Campos Opcionales
    CertificadoEstudio: '',
    CopiaContrato: '',
    ControlAusentismo: '',
    Sanciones: '',
    HojaDeVida: '',
    FotocopiaCedula: '',
    CertificadoEps: '',
    CertificadoAntecedentes: ''
  };
}

function cancelNewEmployee() {
  showNewEmployeeDialog.value = false;
  // Opcional: mostrar confirmación si hay datos sin guardar
}

async function saveNewEmployee() {
  loading.value = true;
  
  // Validar campos requeridos según el modelo de MongoDB
  const requiredFields = [
    'Identificacion', 'Nombre', 'Apellido', 'Correo', 'Telefono', 
    'FechaNacimiento', 'Eps', 'Arl', 'Estrato', 'Edad', 'Hijos',
    'EstadoCivil', 'TipoSangre', 'TipoContrato', 'FechaInicioContrato',
    'FechaFinContrato', 'CajaCompensacion', 'FondoPension', 'PerfilProfesional',
    'UltimoPeriodoVacacional', 'EvaluacionDesempeño', 'Cargo', 'Sueldo',
    'FechaIngresoEmpresa', 'Ciudad', 'Sede', 'Estado'
  ];
  
  const missingFields = requiredFields.filter(field => {
    const value = newEmployee.value[field];
    return !value || value === '' || value === null || (field === 'Sueldo' ? value <= 0 : false);
  });
  
  if (missingFields.length > 0) {
    $q.notify({
      message: `Por favor complete los campos requeridos: ${missingFields.join(', ')}`,
      color: 'negative',
      timeout: 5000
    });
    loading.value = false;
    return;
  }
  
  // Validar formato de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.value.Correo)) {
    $q.notify({
      message: 'Por favor ingrese un correo electrónico válido',
      color: 'negative'
    });
    loading.value = false;
    return;
  }
  
  // Validar que la edad sea razonable
  if (newEmployee.value.Edad < 18 || newEmployee.value.Edad > 100) {
    $q.notify({
      message: 'La edad debe estar entre 18 y 100 años',
      color: 'negative'
    });
    loading.value = false;
    return;
  }

  try {
    // Preparar datos para enviar (asegurar tipos correctos)
    const newEmployeeData = {
      ...newEmployee.value,
      Identificacion: String(newEmployee.value.Identificacion),
      Nombre: String(newEmployee.value.Nombre),
      Apellido: String(newEmployee.value.Apellido),
      Correo: String(newEmployee.value.Correo),
      Telefono: String(newEmployee.value.Telefono),
      Eps: String(newEmployee.value.Eps),
      Arl: String(newEmployee.value.Arl),
      Estrato: String(newEmployee.value.Estrato),
      Edad: Number(newEmployee.value.Edad),
      Hijos: Number(newEmployee.value.Hijos),
      EstadoCivil: String(newEmployee.value.EstadoCivil),
      TipoSangre: String(newEmployee.value.TipoSangre),
      TipoContrato: String(newEmployee.value.TipoContrato),
      CajaCompensacion: String(newEmployee.value.CajaCompensacion),
      FondoPension: String(newEmployee.value.FondoPension),
      PerfilProfesional: String(newEmployee.value.PerfilProfesional),
      EvaluacionDesempeño: String(newEmployee.value.EvaluacionDesempeño),
      Cargo: String(newEmployee.value.Cargo),
      Sueldo: Number(newEmployee.value.Sueldo),
      Ciudad: String(newEmployee.value.Ciudad),
      Sede: String(newEmployee.value.Sede),
      Estado: newEmployee.value.Estado === 'Activo' ? 1 : 0, // Convertir a número
      // Campos opcionales
      CertificadoEstudio: String(newEmployee.value.CertificadoEstudio || ''),
      CopiaContrato: String(newEmployee.value.CopiaContrato || ''),
      ControlAusentismo: String(newEmployee.value.ControlAusentismo || ''),
      Sanciones: String(newEmployee.value.Sanciones || '')
    };

    const response = await postData('User', newEmployeeData);
    console.log('Empleado guardado:', response);

    showNewEmployeeDialog.value = false;
    $q.notify({
      message: 'Empleado guardado exitosamente',
      color: 'positive'
    });
    
    // Recargar la lista de empleados
    await getDataFromApi();
    
  } catch (error) {
    console.error('Error al guardar empleado:', error);
    $q.notify({
      message: 'Error al guardar empleado. Por favor intente nuevamente.',
      color: 'negative'
    });
  } finally {
    loading.value = false;
  }
}

async function getDataFromApi() {
  loading.value = true;
  try {
    const response = await getData('User');
    if (response && Array.isArray(response)) {
      allUsers.value = response;
    } else if (response && typeof response === 'object') {
      allUsers.value = [response];
    } else {
      // Sin datos de ejemplo si no hay respuesta
      allUsers.value = [];
    }
    
    filterEmployees();
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    // Array vacío en caso de error
    allUsers.value = [];
    filterEmployees();
    
    $q.notify({
      message: 'Error al cargar los datos de empleados',
      color: 'negative'
    });
  } finally {
    loading.value = false;
  }
}

// Inicialización
onMounted(async () => {
  getDataFromApi();
});

// Watch para filtrar automáticamente cuando cambien datos o sede
watch([allUsers, currentSede], () => {
  if (allUsers.value.length > 0) {
    filterEmployees();
  }
}, { deep: true });
</script>

<style scoped>
.header-section {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
}

.filter-section {
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
}

.sede-tabs {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
  overflow: hidden;
}

.sede-tabs .q-tab {
  min-height: 48px;
}

.my-sticky-header-table {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
}

.employee-header {
  border-left: 5px solid var(--q-primary);
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 2px;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 500;
}

.documents-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.document-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.document-icon {
  margin-right: 12px;
}

.document-info {
  flex-grow: 1;
}

.document-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.document-date {
  font-size: 0.75rem;
  color: #666;
}

.document-actions {
  margin-left: auto;
}

@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .employee-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .employee-header .col-auto {
    margin-bottom: 15px;
  }
}

/* Estilos responsivos específicos para móviles */
@media (max-width: 599px) {
  /* Reducir padding general en móviles */
  .q-page {
    padding: 8px !important;
  }
  
  /* Header responsivo */
  .header-section {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  /* Filtros en móviles */
  .filter-section {
    padding: 12px;
  }
  
  /* Pestañas más compactas */
  .sede-tabs .q-tab {
    min-height: 40px;
    font-size: 0.75rem;
  }
  
  /* Tarjetas de empleados para móviles */
  .employee-card-mobile {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .employee-card-mobile:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  
  /* Modal responsive */
  .q-dialog .q-card {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
  
  /* Chips más pequeños en móviles */
  .q-chip {
    font-size: 0.7rem;
  }
  
  /* Botones más compactos */
  .q-btn {
    font-size: 0.8rem;
  }
  
  /* Texto más legible en móviles */
  .text-h4 {
    font-size: 1.5rem;
  }
  
  .text-h5 {
    font-size: 1.25rem;
  }
  
  .text-h6 {
    font-size: 1.1rem;
  }
}

/* Mejoras para tablets */
@media (min-width: 600px) and (max-width: 1023px) {
  .q-page {
    padding: 16px;
  }
  
  .header-section {
    padding: 16px;
  }
  
  .filter-section {
    padding: 16px;
  }
}

/* Estilos para pantallas grandes */
@media (min-width: 1024px) {
  .header-section {
    padding: 24px;
  }
  
  .filter-section {
    padding: 20px;
  }
}

/* Estilos adicionales para el formulario de nuevo empleado */
.q-tab-panel {
  padding: 16px 0;
}

.q-card.q-pa-md {
  border: 1px solid #e0e0e0;
}

.text-subtitle1 {
  font-weight: 500;
  color: #1976d2;
}

/* Mejoras para inputs requeridos */
.q-field--outlined .q-field__label {
  color: #666;
}

.q-field--outlined.q-field--focused .q-field__label,
.q-field--outlined.q-field--float .q-field__label {
  color: #1976d2;
}

/* Indicador visual para campos requeridos */
.q-field label:after {
  content: "";
}

.q-field[aria-required="true"] label:after {
  content: " *";
  color: #f44336;
}

/* Espaciado mejorado */
.q-tab-panels > .q-panel {
  padding: 20px 0;
}

.q-card-section .text-h6 {
  color: #1976d2;
  font-weight: 500;
  border-bottom: 2px solid #e3f2fd;
  padding-bottom: 8px;
}

/* Hover effects para las tarjetas */
.q-card.q-pa-md:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
}

.text-primary {
  font-weight: 600;
}
</style>
