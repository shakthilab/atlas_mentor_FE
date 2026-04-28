import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HierarchyService } from '../../../../core/services/hierarchy.service';
import { RoleService, Role } from '../../../../core/services/role.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BranchService } from '../../../../core/services/branch.service';
import { EmployeeService, Employee } from '../../../../core/services/employee.service';

@Component({
  selector: 'app-hierarchy-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hierarchy-layout">
      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Header Section -->
        <div class="header-section">
          <div class="header-title">
            <h1>Hierarchy Management</h1>
            <p>Manage reporting structure and team assignments</p>
          </div>
          <div class="header-actions">
            <div class="search-box">
              <span class="material-icons">search</span>
              <input type="text" [(ngModel)]="searchQuery" placeholder="Search people, teams...">
            </div>
            <div class="location-picker">
              <span class="material-icons loc-icon">place</span>
              <select [(ngModel)]="locationFilter">
                <option>All locations</option>
                <option *ngFor="let branch of branches">{{ branch.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- KPI Cards Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-label">Total Teams</span>
              <div class="stat-value-wrap">
                <span class="stat-value">{{ stats.totalTeams }}</span>
              </div>
              <span class="stat-change positive">+2 this month</span>
            </div>
            <div class="stat-icon team-icon">
              <span class="material-icons">account_tree</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-label">Total Members</span>
              <div class="stat-value-wrap">
                <span class="stat-value">{{ stats.totalMembers }}</span>
              </div>
              <span class="stat-change">Across all roles</span>
            </div>
            <div class="stat-icon member-icon">
              <span class="material-icons">groups</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-label">Locations</span>
              <div class="stat-value-wrap">
                <span class="stat-value">{{ stats.totalLocations }}</span>
              </div>
              <span class="stat-change">Active branches</span>
            </div>
            <div class="stat-icon location-icon">
              <span class="material-icons">location_on</span>
            </div>
          </div>

          <div class="stat-card ghost">
             <div class="stat-info">
               <span class="stat-label">Active Roles</span>
               <div class="stat-value-wrap">
                 <span class="stat-value">5</span>
               </div>
               <span class="stat-change">Configured roles</span>
             </div>
             <div class="stat-icon role-icon">
               <span class="material-icons">badge</span>
             </div>
          </div>
        </div>

        <!-- Organization Tree Card -->
        <div class="org-tree-card">
          <div class="card-header">
            <div class="card-title-info">
              <div class="card-icon">
                <span class="material-icons">account_tree</span>
              </div>
              <div>
                <h3>Organization Tree</h3>
                <p>{{ stats.totalTeams }} teams • Click a node to expand</p>
              </div>
            </div>
            <button class="btn btn-outline btn-add-manager" (click)="openAddManagerModal()">
              <span class="material-icons">add</span>
              Add Manager
            </button>
          </div>

          <div class="tree-container">
            <!-- Loading State -->
            <div class="tree-loader-overlay" *ngIf="isLoading">
              <div class="loader-content">
                <div class="spinner"></div>
                <p>Loading hierarchy data...</p>
              </div>
            </div>

            <div class="tree-view" *ngIf="!isLoading">
              <!-- Root Managers -->
              <ng-container *ngFor="let team of filteredHierarchy">
                <ng-container *ngTemplateOutlet="nodeTemplate; context: { $implicit: team, isRoot: true, level: 'MANAGER' }"></ng-container>
              </ng-container>

              <!-- Node Template -->
              <ng-template #nodeTemplate let-team let-isRoot="isRoot" let-level="level">
                <div class="tree-node" [class.parent-node]="level === 'MANAGER'">
                  <div class="node-content" [class.expanded]="isExpanded(team.leader.id)">
                    <div class="node-main" (click)="toggleNode(team.leader.id)">
                      <div class="node-toggle">
                        <span class="material-icons" *ngIf="getFilteredMembers(team, level).length > 0 || level === 'MANAGER' || isSenior(team.leader)">
                          {{ isExpanded(team.leader.id) ? 'keyboard_arrow_down' : 'keyboard_arrow_right' }}
                        </span>
                      </div>
                      <div class="node-avatar" [class.manager-avatar]="level === 'MANAGER'">
                        {{ team.leader.name.charAt(0) }}
                      </div>
                      <div class="node-info">
                        <div class="name-role">
                          <span class="name">{{ team.leader.name }}</span>
                          <span class="badge" 
                                [class.badge-manager]="level === 'MANAGER'" 
                                [class.badge-senior]="level === 'SENIOR'">
                            {{ getDisplayRole(team.leader, level) }}
                          </span>
                        </div>
                        <div class="meta">
                          <span class="location"><span class="material-icons">place</span> {{ team.leader.branch?.name || team.leader.branch }}</span>
                          <span class="reports" *ngIf="getFilteredMembers(team, level).length > 0">• {{ getFilteredMembers(team, level).length }} reports</span>
                        </div>
                      </div>
                      
                      <!-- Actions for the Leader -->
                      <div class="node-actions">
                        <button class="action-btn" (click)="$event.stopPropagation(); openAssignModal(team, level)" title="Add Member">
                          <span class="material-icons">person_add</span>
                        </button>
                        <button class="action-btn" *ngIf="!isRoot" (click)="$event.stopPropagation(); openUnassignModal(team.leader)" title="Unassign">
                          <span class="material-icons">person_remove</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Members Section -->
                  <div class="node-children" *ngIf="isExpanded(team.leader.id)">
                    <div class="child-node" *ngFor="let member of getFilteredMembers(team, level)">
                      <div class="node-line"></div>
                      
                      <!-- Sub-team Level (Senior) -->
                      <ng-container *ngIf="getSubTeam(member); let subTeam; else leafMember">
                        <ng-container *ngTemplateOutlet="nodeTemplate; context: { $implicit: subTeam, isRoot: false, level: 'SENIOR' }"></ng-container>
                      </ng-container>

                      <!-- Leaf Level -->
                      <ng-template #leafMember>
                        <div class="node-content child">
                          <div class="node-main">
                            <div class="node-toggle spacer"></div>
                            <div class="node-avatar child-avatar">{{ member.name.charAt(0) }}</div>
                            <div class="node-info">
                              <div class="name-role">
                                <span class="name">{{ member.name }}</span>
                                <span class="badge" 
                                      [class.badge-junior]="isJunior(member)"
                                      [class.badge-other]="!isJunior(member) && !isSenior(member) && !isManager(member)">
                                  {{ getDisplayRole(member) }}
                                </span>
                              </div>
                              <div class="meta">
                                <span class="location"><span class="material-icons">place</span> {{ team.leader.branch?.name || team.leader.branch }}</span>
                              </div>
                            </div>
                            <div class="node-actions">
                              <button class="action-btn" (click)="$event.stopPropagation(); openUnassignModal(member)" title="Unassign">
                                <span class="material-icons">person_remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </ng-template>
                    </div>

                    <!-- Add Button at bottom -->
                    <button class="btn-add-member" (click)="openAssignModal(team, level)">
                      <span class="material-icons">add</span>
                      Add new team member
                    </button>
                  </div>
                </div>
              </ng-template>

              <!-- Empty State -->
              <div class="empty-tree" *ngIf="filteredHierarchy.length === 0">
                <span class="material-icons">search_off</span>
                <p>No results found for your search.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar: Quick Assignment -->
      <div class="right-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-header">
            <h3>Quick Assignment</h3>
            <p>Map employees under a reporting manager.</p>
          </div>

          <div class="sidebar-content">
            <div class="form-group">
              <label>Select Manager</label>
              <div class="select-wrapper">
                <select class="form-control" [(ngModel)]="sidebarSelectedManagerId" (change)="onSidebarManagerChange()">
                  <option [ngValue]="null">Select a manager...</option>
                  <optgroup label="Managers">
                    <option *ngFor="let team of managerHierarchy" [ngValue]="team.leader.id">
                      {{ team.leader.name }} (Manager)
                    </option>
                  </optgroup>
                  <optgroup label="Senior Counsellors">
                    <option *ngFor="let team of counsellorHierarchy" [ngValue]="team.leader.id">
                      {{ team.leader.name }} (Senior)
                    </option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label>Select Employees</label>
                <span class="selection-count">{{ selectedEmployeeIds.length }} selected</span>
              </div>
              <p class="text-muted" style="font-size: 0.75rem; margin-top: -0.25rem; margin-bottom: 0.75rem;" *ngIf="sidebarSelectedManagerId">
                {{ getSidebarConstraintText() }}
              </p>
              <div class="employee-search">
                <span class="material-icons">search</span>
                <input type="text" placeholder="Search employees..." [(ngModel)]="sidebarEmployeeSearch">
              </div>
              <div class="employee-list-selection">
                <div class="selection-item" *ngFor="let emp of filteredSidebarEmployees" 
                     [class.selected]="selectedEmployeeIds.includes(emp.id)"
                     (click)="toggleEmployeeSelection(emp.id)">
                  <div class="check-box" [class.checked]="selectedEmployeeIds.includes(emp.id)">
                    <span class="material-icons" *ngIf="selectedEmployeeIds.includes(emp.id)">check</span>
                  </div>
                  <div class="emp-avatar">{{ emp.name.charAt(0) }}</div>
                  <div class="emp-info">
                    <span class="emp-name">{{ emp.name }}</span>
                    <span class="badge" [class.badge-senior]="isSenior(emp)" [class.badge-junior]="isJunior(emp)" style="font-size: 0.625rem;">
                      {{ getDisplayRole(emp) }}
                    </span>
                  </div>
                </div>
                
                <div class="no-data-msg" *ngIf="filteredSidebarEmployees.length === 0 && sidebarSelectedManagerId">
                  No eligible candidates found.
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-footer">
            <button class="btn btn-tertiary" (click)="cancelSidebarAssignment()">
              <span class="material-icons">close</span>
              Cancel
            </button>
            <button class="btn btn-primary" [disabled]="!sidebarSelectedManagerId || selectedEmployeeIds.length === 0 || isSubmitting" (click)="saveSidebarAssignment()">
              <ng-container *ngIf="!isSubmitting">Save Assignment</ng-container>
              <ng-container *ngIf="isSubmitting">
                <div class="spinner-inline"></div>
                Saving...
              </ng-container>
            </button>
          </div>
        </div>
      </div>

      <!-- Assignment Modal -->
      <div class="modal-overlay" *ngIf="showAssignModal" (click)="closeAssignModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
               <div class="modal-icon">
                 <span class="material-icons">person_add</span>
               </div>
               <h2 class="modal-title">Assign Employees</h2>
            </div>
            <button class="close-btn" (click)="closeAssignModal()">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="modal-body">
            <p class="modal-subtitle" *ngIf="currentTeam">
               Assigning new members to <strong>{{ currentTeam?.leader?.name || 'the organization' }}</strong>'s team.
            </p>
            
            <div class="alert alert-info" *ngIf="getModalConstraintText()">
              <span class="material-icons">info</span>
              <p>{{ getModalConstraintText() }}</p>
            </div>
            
            <div class="form-group">
              <label>Select Role to Map</label>
              <div class="select-wrapper">
                <select class="form-control" [(ngModel)]="selectedRoleName" (change)="onRoleChange()">
                  <option value="" disabled selected>Choose a role...</option>
                  <option *ngFor="let role of rolesList" [value]="role.name">{{ role.displayName || role.name }}</option>
                </select>
              </div>
            </div>

            <div class="form-group" *ngIf="selectedRoleName">
              <div class="label-row">
                <label>Available Candidates</label>
                <span class="selection-count" *ngIf="!fetchingEmployees">{{ selectedEmployeeIds.length }} selected</span>
              </div>
              
              <div class="loading-inline" *ngIf="fetchingEmployees">
                <div class="spinner-sm"></div>
                <span>Searching for available {{ formatRole(selectedRoleName) }}s...</span>
              </div>

              <div class="employee-selection-list" *ngIf="!fetchingEmployees">
                <div class="no-selection-data" *ngIf="employeesByRoleList.length === 0">
                  <span class="material-icons">sentiment_dissatisfied</span>
                  <p>No available employees found for this role in this branch.</p>
                </div>

                <div class="selection-item" *ngFor="let emp of employeesByRoleList" 
                     [class.selected]="selectedEmployeeIds.includes(emp.id)"
                     (click)="toggleEmployeeSelection(emp.id)">
                  <div class="selection-check">
                    <span class="material-icons">{{ selectedEmployeeIds.includes(emp.id) ? 'check_box' : 'check_box_outline_blank' }}</span>
                  </div>
                  <div class="selection-details">
                    <span class="name">{{ emp.name }}</span>
                    <span class="sub">{{ emp.email }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-primary btn-block" 
                      [disabled]="selectedEmployeeIds.length === 0 || isSubmitting"
                      (click)="assignEmployees()">
                <ng-container *ngIf="!isSubmitting">
                  Map {{ selectedEmployeeIds.length }} Employees
                </ng-container>
                <ng-container *ngIf="isSubmitting">
                  <div class="spinner-inline"></div>
                  Processing...
                </ng-container>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Unassign Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showUnassignModal" (click)="cancelUnassign()">
        <div class="modal-content confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-body text-center" style="padding-top: 2.5rem;">
            <div class="confirm-icon-wrap btn-danger">
              <span class="material-icons">person_remove</span>
            </div>
            <h2 class="modal-title mb-2">Confirm Unassignment</h2>
            <p class="text-muted mb-4">
              Are you sure you want to unassign <strong>{{ memberToUnassign?.name }}</strong>? They will no longer be mapped to this team.
            </p>
            <div class="modal-footer" style="padding: 0; margin-top: 2rem;">
              <button type="button" class="btn btn-danger btn-block" (click)="executeUnassign()" [disabled]="isUnassigning">
                <ng-container *ngIf="!isUnassigning">Unassign</ng-container>
                <ng-container *ngIf="isUnassigning">
                  <div class="spinner-inline"></div>
                  Removing...
                </ng-container>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Add Manager Modal -->
      <div class="modal-overlay" *ngIf="showAddManagerModal" (click)="closeAddManagerModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
               <div class="modal-icon">
                 <span class="material-icons">person_add</span>
               </div>
               <h2 class="modal-title">Add New Manager</h2>
            </div>
            <button class="close-btn" (click)="closeAddManagerModal()">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="modal-body">
            <p class="modal-subtitle">Enter details for the new manager.</p>
            
            <form #managerForm="ngForm" (ngSubmit)="onSubmitManager()">
              <div class="form-group">
                <label for="mgrName">Full Name</label>
                <input type="text" id="mgrName" name="name" class="form-control" [(ngModel)]="newManager.name" placeholder="e.g., John Manager" required>
              </div>

              <div class="form-group">
                <label for="mgrEmail">Email Address</label>
                <input type="email" id="mgrEmail" name="email" class="form-control" [(ngModel)]="newManager.email" placeholder="e.g., manager@company.com" required>
              </div>

              <div class="form-group">
                <label for="mgrPhone">Phone Number</label>
                <input type="text" id="mgrPhone" name="phone" class="form-control" [(ngModel)]="newManager.phone" placeholder="e.g., +1234567890" required>
              </div>

              <div class="form-group">
                <label for="mgrRole">Role</label>
                <select id="mgrRole" name="roleId" class="form-control" [(ngModel)]="newManager.roleId" required disabled>
                  <option value="" disabled selected>Select Role</option>
                  <option *ngFor="let role of managerRoles" [value]="role.id">{{ role.displayName || role.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="mgrBranch">Branch</label>
                <select id="mgrBranch" name="branchId" class="form-control" [(ngModel)]="newManager.branchId" required>
                  <option value="" disabled selected>Select Branch</option>
                  <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
                </select>
              </div>

              <div class="modal-footer">
                <button type="submit" class="btn btn-primary btn-block" [disabled]="managerForm.invalid || submittingManager">
                  <span *ngIf="!submittingManager">Create Manager</span>
                  <span *ngIf="submittingManager">Processing...</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hierarchy-layout { 
      display: grid; 
      grid-template-columns: 1fr 340px; 
      gap: 2rem; 
      padding-bottom: 2rem;
    }

    .main-content { display: flex; flex-direction: column; gap: 2rem; }

    /* Header Section */
    .header-section { display: flex; justify-content: space-between; align-items: center; background: white; padding: 1.25rem 1.5rem; border-radius: 12px; border: 1px solid #eaecf0; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05); }
    .header-title h1 { font-size: 1.25rem; font-weight: 700; color: #101828; margin-bottom: 0.125rem; }
    .header-title p { color: #667085; font-size: 0.8125rem; }

    .header-actions { display: flex; gap: 0.75rem; align-items: center; }
    
    .search-box { position: relative; }
    .search-box .material-icons { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #667085; font-size: 1.125rem; }
    .search-box input { padding: 0.5rem 0.75rem 0.5rem 2.25rem; border: 1px solid #d0d5dd; border-radius: 8px; font-size: 0.875rem; width: 240px; transition: 0.2s; }
    .search-box input:focus { border-color: #2e90fa; box-shadow: 0 0 0 4px #eff4ff; outline: none; }

    .location-picker { position: relative; }
    .location-picker .loc-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #667085; font-size: 1.125rem; z-index: 1; pointer-events: none; }
    .location-picker select { 
      padding: 0.5rem 2rem 0.5rem 2.25rem; 
      border: 1px solid #d0d5dd; 
      border-radius: 8px; 
      font-size: 0.875rem; 
      appearance: none; 
      background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23667085' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E") no-repeat right 0.75rem center;
      min-width: 180px;
      cursor: pointer;
      transition: 0.2s;
    }
    .location-picker select:hover { border-color: #b2ccff; }
    .location-picker select:focus { border-color: #2e90fa; box-shadow: 0 0 0 4px #eff4ff; outline: none; }

    /* KPI Cards */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #eaecf0; display: flex; justify-content: space-between; align-items: flex-start; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1); }
    .stat-label { font-size: 0.75rem; font-weight: 600; color: #667085; text-transform: none; margin-bottom: 0.5rem; display: block; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #101828; }
    .stat-change { font-size: 0.75rem; margin-top: 0.5rem; display: block; color: #667085; }
    .stat-change.positive { color: #027a48; font-weight: 600; }
    .stat-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .stat-icon .material-icons { font-size: 1.25rem; }
    .team-icon { background: #eff4ff; color: #2e90fa; }
    .member-icon { background: #f9f5ff; color: #7f56d9; }
    .location-icon { background: #f2f4f7; color: #667085; }
    .role-icon { background: #fef6ee; color: #b93815; }

    /* Org Tree Card */
    .org-tree-card { background: white; border-radius: 12px; border: 1px solid #eaecf0; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1); position: relative; min-height: 400px; }
    .org-tree-card .card-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #eaecf0; display: flex; justify-content: space-between; align-items: center; }
    .card-title-info { display: flex; gap: 0.75rem; align-items: center; }
    .card-icon { width: 36px; height: 36px; border-radius: 8px; background: #eff4ff; color: #2e90fa; display: flex; align-items: center; justify-content: center; }
    .card-title-info h3 { font-size: 1rem; font-weight: 600; color: #101828; margin: 0; }
    .card-title-info p { font-size: 0.75rem; color: #667085; margin: 0; }
    .btn-add-manager { border-color: #d0d5dd; color: #344054; font-size: 0.8125rem; padding: 0.5rem 0.875rem; }

    /* Tree View Styles */
    .tree-container { padding: 1.5rem; min-height: 300px; position: relative; }
    .tree-node { margin-bottom: 1rem; }
    .node-content { border-radius: 8px; border: 1px solid #eaecf0; transition: all 0.2s; background: white; }
    .node-content.expanded { border-color: #d0d5dd; }
    .node-main { padding: 1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; position: relative; }
    .node-main:hover { background-color: #f9fafb; }
    
    .node-toggle { width: 24px; display: flex; align-items: center; justify-content: center; color: #667085; }
    .node-avatar { width: 40px; height: 40px; border-radius: 50%; background: #f2f4f7; color: #475467; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; border: 1px solid #eaecf0; }
    .manager-avatar { background: #eff4ff; color: #2e90fa; }
    
    .node-info { flex: 1; }
    .name-role { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.125rem; }
    .name-role .name { font-weight: 600; color: #101828; font-size: 0.9375rem; }
    
    .badge { padding: 0.125rem 0.5rem; border-radius: 6px; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.025em; min-width: 110px; text-align: center; }
    .badge-manager { background: #eff4ff; color: #175cd3; }
    .badge-senior { background: #fdf2fa; color: #c11574; }
    .badge-junior { background: #ecfdf3; color: #027a48; }
    .badge-other { background: #f2f4f7; color: #344054; }
    
    .meta { font-size: 0.75rem; color: #667085; display: flex; align-items: center; gap: 0.5rem; }
    .meta .material-icons { font-size: 0.875rem; vertical-align: middle; }

    /* Children Styles */
    .node-children { margin-left: 3rem; margin-top: 0.5rem; position: relative; }
    .child-node { position: relative; margin-bottom: 0.75rem; }
    .node-line { position: absolute; left: -1.5rem; top: -1rem; bottom: 50%; width: 1.5rem; border-left: 2px solid #eaecf0; border-bottom: 2px solid #eaecf0; border-bottom-left-radius: 12px; }
    .child-node:not(:last-child)::after { content: ''; position: absolute; left: -1.5rem; top: 50%; bottom: -0.75rem; border-left: 2px solid #eaecf0; }
    
    .node-content.child { border: 1px solid #eaecf0; background: #fff; }
    .child-avatar { width: 32px; height: 32px; font-size: 0.75rem; }
    
    .node-actions { display: none; gap: 0.25rem; align-items: center; }
    .node-main:hover .node-actions { display: flex; }
    
    .action-btn { background: none; border: none; color: #667085; cursor: pointer; padding: 4px; border-radius: 4px; transition: 0.2s; }
    .action-btn:hover { background: #f2f4f7; color: #101828; }
    .action-btn.delete:hover { background: #fef2f2; color: #d92d20; }

    .btn-add-member { margin-left: 0.5rem; margin-top: 0.5rem; background: none; border: none; color: #2e90fa; font-size: 0.8125rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem; cursor: pointer; padding: 0.5rem; }
    .btn-add-member:hover { color: #1570ef; }

    /* Tree Loader */
    .tree-loader-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 10; border-radius: 0 0 12px 12px; }
    .loader-content { text-align: center; }
    .loader-content p { color: #667085; font-size: 0.875rem; font-weight: 500; margin-top: 1rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #2e90fa; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .no-data-msg { padding: 2rem 1rem; text-align: center; color: #667085; font-size: 0.8125rem; }

    /* Sidebar Styles */
    .right-sidebar { position: sticky; top: 1.5rem; height: calc(100vh - 3rem); }
    .sidebar-card { background: white; border-radius: 12px; border: 1px solid #eaecf0; height: 100%; display: flex; flex-direction: column; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1); }
    .sidebar-header { padding: 1.5rem; border-bottom: 1px solid #eaecf0; }
    .sidebar-header h3 { font-size: 1rem; font-weight: 600; color: #101828; margin-bottom: 0.25rem; }
    .sidebar-header p { font-size: 0.8125rem; color: #667085; }

    .sidebar-content { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .selection-count { font-size: 0.75rem; color: #667085; }
    
    .employee-search { position: relative; margin-bottom: 0.75rem; }
    .employee-search .material-icons { position: absolute; left: 0.625rem; top: 50%; transform: translateY(-50%); font-size: 1rem; color: #667085; }
    .employee-search input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.25rem; border: 1px solid #d0d5dd; border-radius: 8px; font-size: 0.8125rem; }

    .employee-list-selection { display: flex; flex-direction: column; gap: 2px; }
    
    /* Shared Selection Item Styles */
    .selection-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem; border-radius: 8px; cursor: pointer; transition: 0.2s; }
    .selection-item:hover { background: #f9fafb; }
    .selection-item.selected { background: #eff4ff; }
    
    .check-box { width: 18px; height: 18px; border: 1px solid #d0d5dd; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: white; }
    .check-box.checked { background: #2e90fa; border-color: #2e90fa; color: white; }
    .check-box .material-icons { font-size: 0.875rem; }
    
    .emp-avatar { width: 24px; height: 24px; border-radius: 50%; background: #f2f4f7; font-size: 0.6875rem; font-weight: 600; display: flex; align-items: center; justify-content: center; }
    .emp-info { flex: 1; display: flex; justify-content: space-between; align-items: center; }
    .emp-name { font-size: 0.8125rem; font-weight: 500; color: #344054; }

    .spinner-inline { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }

    /* Modal Specific Selection Styles */
    .employee-selection-list { max-height: 250px; overflow-y: auto; border: 1px solid #eaecf0; border-radius: 8px; margin-top: 0.5rem; }
    .selection-details { display: flex; flex-direction: column; gap: 2px; }
    .selection-details .name { font-weight: 600; color: #101828; font-size: 0.875rem; line-height: 1.25; }
    .selection-details .sub { font-size: 0.75rem; color: #667085; line-height: 1.25; }
    .selection-check { color: #667085; display: flex; align-items: center; }
    .selection-item.selected .selection-check { color: #2e90fa; }

    .sidebar-footer { padding: 1.25rem; border-top: 1px solid #eaecf0; display: flex; flex-direction: column; gap: 0.75rem; }
    .btn-tertiary { color: #344054; }

    .alert { padding: 1rem; border-radius: 10px; display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 1.5rem; border: 1px solid transparent; }
    .alert-info { background: #eff4ff; color: #175cd3; border-color: #b2ccff; }
    .alert-info .material-icons { color: #2e90fa; font-size: 1.25rem; }
    .alert-info p { font-size: 0.8125rem; margin: 0; line-height: 1.4; font-weight: 500; }

    /* Assignment Modal Styling */
    .modal-title-wrap { display: flex; align-items: center; gap: 0.75rem; }
    .modal-icon { width: 32px; height: 32px; border-radius: 8px; background: #eff4ff; color: #2e90fa; display: flex; align-items: center; justify-content: center; }
    .modal-icon .material-icons { font-size: 1.25rem; }
    .modal-subtitle { font-size: 0.875rem; color: #475467; margin-bottom: 1.25rem; }

    @media (max-width: 1200px) {
      .hierarchy-layout { grid-template-columns: 1fr; }
      .right-sidebar { display: none; }
    }
  `]
})
export class HierarchyManagerComponent implements OnInit {
  private hierarchyService = inject(HierarchyService);
  private roleService = inject(RoleService);
  private notificationService = inject(NotificationService);
  private branchService = inject(BranchService);
  private employeeService = inject(EmployeeService);

  // Add Manager State
  showAddManagerModal = false;
  submittingManager = false;
  managerRoles: Role[] = [];
  newManager: Partial<Employee> = {
    name: '',
    email: '',
    phone: '',
    branchId: undefined as unknown as number,
    roleId: undefined as unknown as number
  };


  counsellorHierarchy: any[] = [];
  managerHierarchy: any[] = [];
  branches: any[] = [];

  // UI State
  stats = {
    totalTeams: 0,
    totalMembers: 0,
    totalLocations: 0
  };
  searchQuery = '';
  locationFilter = 'All locations';
  expandedNodes: Set<number> = new Set();
  isLoading = false;

  // Sidebar State
  sidebarSelectedManagerId: number | null = null;
  sidebarEmployeeSearch = '';
  sidebarEmployees: any[] = [];

  // Modal State
  showAssignModal = false;
  rolesList: Role[] = [];
  selectedRoleName = '';
  employeesByRoleList: any[] = [];
  selectedEmployeeIds: number[] = [];
  currentTeam: any = null;
  currentLevel: string = '';
  fetchingEmployees = false;
  isSubmitting = false;

  // Unassign Modal State
  showUnassignModal = false;
  memberToUnassign: any = null;
  isUnassigning = false;

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading = true;
    this.loadHierarchy();
    this.loadBranches();
    this.loadAllEmployees();
  }

  loadHierarchy() {
    const counsellorsObs = this.hierarchyService.getCounsellorsHierarchy();
    const managersObs = this.hierarchyService.getManagersHierarchy();

    counsellorsObs.subscribe({
      next: (data: any) => {
        this.counsellorHierarchy = data;
        this.calculateStats();
        this.checkAllLoaded();
      },
      error: (err: any) => {
        console.error('Failed to fetch counsellors hierarchy', err);
        this.checkAllLoaded();
      }
    });

    managersObs.subscribe({
      next: (data: any) => {
        this.managerHierarchy = data;
        this.calculateStats();
        this.checkAllLoaded();
      },
      error: (err: any) => {
        console.error('Failed to fetch managers hierarchy', err);
        this.checkAllLoaded();
      }
    });
  }

  private checkAllLoaded() {
    if (this.counsellorHierarchy.length >= 0 && this.managerHierarchy.length >= 0) {
      setTimeout(() => this.isLoading = false, 300);
    }
  }

  loadBranches() {
    this.branchService.getAllBranches().subscribe({
      next: (data) => {
        this.branches = data;
        this.stats.totalLocations = data.length;
      }
    });
  }

  loadAllEmployees() {
    this.branchService.getUnassignedEmployees().subscribe({
      next: (emps) => {
        this.sidebarEmployees = emps;
      },
      error: (err) => console.error('Failed to load unassigned employees', err)
    });
  }

  calculateStats() {
    const allTeams = [...this.managerHierarchy, ...this.counsellorHierarchy];
    this.stats.totalTeams = allTeams.length;
    
    let membersSet = new Set();
    
    allTeams.forEach(team => {
      membersSet.add(team.leader.id);
      const members = team.employees || team.members || [];
      members.forEach((m: any) => {
        membersSet.add(m.id);
      });
    });
    
    this.stats.totalMembers = membersSet.size;
  }

  get filteredHierarchy() {
    const managerLeaderIds = new Set(this.managerHierarchy.map(t => t.leader.id));
    const managerMemberIds = new Set();
    this.managerHierarchy.forEach(t => {
      const members = t.employees || t.members || [];
      members.forEach((m: any) => managerMemberIds.add(m.id));
    });
    
    const independentCounsellors = this.counsellorHierarchy.filter(t => 
      !managerMemberIds.has(t.leader.id) && !managerLeaderIds.has(t.leader.id)
    );
    
    let allTopLevel = [...this.managerHierarchy, ...independentCounsellors];
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      allTopLevel = allTopLevel.filter(team => 
        team.leader.name.toLowerCase().includes(query) ||
        (team.employees || team.members || []).some((m: any) => m.name.toLowerCase().includes(query))
      );
    }
    
    if (this.locationFilter !== 'All locations') {
      allTopLevel = allTopLevel.filter(team => team.leader.branch?.name === this.locationFilter || team.leader.branch === this.locationFilter);
    }
    
    return allTopLevel;
  }

  get filteredSidebarEmployees() {
    let filtered = this.sidebarEmployees;
    
    if (this.sidebarSelectedManagerId) {
      const selectedManager = this.managerHierarchy.find(t => t.leader.id === this.sidebarSelectedManagerId) || 
                              this.counsellorHierarchy.find(t => t.leader.id === this.sidebarSelectedManagerId);
      
      if (selectedManager) {
        const leaderRole = (selectedManager.leader.primaryRole || (selectedManager.leader.roles && selectedManager.leader.roles[0]) || '').toUpperCase();
        if (leaderRole.includes('MANAGER') || leaderRole === 'ADMIN') {
          filtered = filtered.filter(emp => {
            const role = (emp.primaryRole || (emp.roles && emp.roles[0]) || '').toUpperCase();
            return role !== 'JUNIOR_COUNSELLOR' && role !== 'STUDENT' && !role.includes('MANAGER');
          });
        } else if (leaderRole.includes('SENIOR')) {
          filtered = filtered.filter(emp => {
            const role = (emp.primaryRole || (emp.roles && emp.roles[0]) || '').toUpperCase();
            return role === 'JUNIOR_COUNSELLOR';
          });
        }
      }
    }

    if (!this.sidebarEmployeeSearch) return filtered;
    const query = this.sidebarEmployeeSearch.toLowerCase();
    return filtered.filter(emp => emp.name.toLowerCase().includes(query));
  }

  isExpanded(id: number): boolean {
    return this.expandedNodes.has(id);
  }

  toggleNode(id: number) {
    if (this.expandedNodes.has(id)) {
      this.expandedNodes.delete(id);
    } else {
      this.expandedNodes.add(id);
    }
  }

  getDisplayRole(member: any, level?: string): string {
    if (level === 'MANAGER') return 'Manager';
    if (level === 'SENIOR') return 'Senior Counsellor';
    
    const role = this.getRoleName(member);
    if (role.includes('MANAGER') || role === 'ADMIN') return 'Manager';
    if (role.includes('SENIOR')) return 'Senior Counsellor';
    if (role.includes('JUNIOR')) return 'Junior Counsellor';
    
    return this.formatRole(role) || 'Team Member';
  }

  getFilteredMembers(team: any, level: string) {
    if (!team) return [];
    const members = team.employees || team.members || [];
    
    if (level === 'MANAGER') {
      const assignedToSeniorIds = new Set();
      this.counsellorHierarchy.forEach(ch => {
        const chMembers = ch.employees || ch.members || [];
        chMembers.forEach((m: any) => assignedToSeniorIds.add(m.id));
      });

      return members.filter((m: any) => !assignedToSeniorIds.has(m.id));
    }
    
    return members;
  }

  private getRoleName(member: any): string {
    if (!member) return '';
    if (member.primaryRole) return member.primaryRole.toString().toUpperCase();
    if (member.roles && member.roles.length > 0) {
      const firstRole = member.roles[0];
      return (typeof firstRole === 'string' ? firstRole : firstRole.name || '').toUpperCase();
    }
    return '';
  }

  isManager(member: any): boolean {
    const role = this.getRoleName(member);
    return role.includes('MANAGER') || role === 'ADMIN';
  }

  isSenior(member: any): boolean {
    const role = this.getRoleName(member);
    return role.includes('SENIOR') || this.counsellorHierarchy.some(team => team.leader.id === member.id);
  }

  isJunior(member: any): boolean {
    const role = this.getRoleName(member);
    return role.includes('JUNIOR');
  }

  getSubTeam(member: any) {
    return this.counsellorHierarchy.find(team => team.leader.id === member.id);
  }

  // Sidebar Actions
  onSidebarManagerChange() {
    this.selectedEmployeeIds = [];
  }

  getSidebarConstraintText() {
    const selectedManager = this.managerHierarchy.find(t => t.leader.id === this.sidebarSelectedManagerId) || 
                            this.counsellorHierarchy.find(t => t.leader.id === this.sidebarSelectedManagerId);
    if (!selectedManager) return '';
    
    const leaderRole = (selectedManager.leader.primaryRole || (selectedManager.leader.roles && selectedManager.leader.roles[0]) || '').toUpperCase();
    if (leaderRole.includes('MANAGER') || leaderRole === 'ADMIN') return 'Managers can assign Seniors, Editors, and other staff.';
    if (leaderRole.includes('SENIOR')) return 'Senior Counsellors can only assign Junior Counsellors.';
    return '';
  }

  cancelSidebarAssignment() {
    this.sidebarSelectedManagerId = null;
    this.selectedEmployeeIds = [];
    this.sidebarEmployeeSearch = '';
  }

  saveSidebarAssignment() {
    if (!this.sidebarSelectedManagerId || this.selectedEmployeeIds.length === 0) return;
    
    this.isSubmitting = true;
    
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        const selectedManager = this.managerHierarchy.find(t => t.leader.id === this.sidebarSelectedManagerId) || 
                                this.counsellorHierarchy.find(t => t.leader.id === this.sidebarSelectedManagerId);
        
        if (!selectedManager) {
          this.isSubmitting = false;
          return;
        }

        const leaderRole = this.getRoleName(selectedManager.leader);
        
        if (leaderRole.includes('SENIOR')) {
          const juniorPayload = {
            seniorCounsellorId: this.sidebarSelectedManagerId!,
            juniorCounsellorIds: this.selectedEmployeeIds
          };

          this.hierarchyService.assignJuniorCounsellors(juniorPayload).subscribe({
            next: () => {
              this.notificationService.success('Assignment saved successfully');
              this.handlePostAssignmentActions();
            },
            error: () => {
              this.notificationService.error('Failed to save assignment');
              this.isSubmitting = false;
            }
          });
        } else {
          let targetRoleName = 'SENIOR_COUNSELLOR'; 
          const role = roles.find(r => r.name === targetRoleName);
          
          const payload = {
            roleId: role?.id || 0, 
            managerId: this.sidebarSelectedManagerId!,
            userIds: this.selectedEmployeeIds
          };

          this.hierarchyService.assignEmployees(payload).subscribe({
            next: () => {
              this.notificationService.success('Assignment saved successfully');
              this.handlePostAssignmentActions();
            },
            error: () => {
              this.notificationService.error('Failed to save assignment');
              this.isSubmitting = false;
            }
          });
        }
      }
    });
  }

  // Modal Logic
  getModalConstraintText() {
    if (!this.currentTeam) return '';
    if (this.currentLevel === 'MANAGER') return 'Managers can map Senior Counsellors and other staff, but not other Managers or Junior Counsellors.';
    if (this.currentLevel === 'SENIOR') return 'As a Senior Counsellor, you can only map Junior Counsellors under you.';
    return '';
  }

  openAssignModal(team: any, level: string = '') {
    this.currentTeam = team;
    this.currentLevel = level;
    this.showAssignModal = true;
    this.selectedRoleName = '';
    this.employeesByRoleList = [];
    this.selectedEmployeeIds = [];
    
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        if (level === 'MANAGER') {
          this.rolesList = roles.filter(role => 
            role.name !== 'ADMIN' && 
            role.name !== 'JUNIOR_COUNSELLOR' && 
            role.name !== 'STUDENT' &&
            !role.name.includes('MANAGER')
          );
        } else if (level === 'SENIOR') {
          this.rolesList = roles.filter(role => role.name === 'JUNIOR_COUNSELLOR');
          if (this.rolesList.length > 0) {
            this.selectedRoleName = this.rolesList[0].name;
            this.onRoleChange();
          }
        } else {
          this.rolesList = roles.filter(role => 
            role.name !== 'ADMIN' && 
            !role.name.includes('MANAGER') && 
            role.name !== 'STUDENT'
          );
        }
      }
    });
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.currentTeam = null;
    this.currentLevel = '';
  }

  onRoleChange() {
    if (!this.selectedRoleName) {
      this.employeesByRoleList = [];
      return;
    }

    this.fetchingEmployees = true;
    const branchId = this.currentTeam?.leader?.branchId || this.currentTeam?.leader?.branch?.id || 0;
    this.hierarchyService.getUsersByRole(this.selectedRoleName, branchId).subscribe({
      next: (employees) => {
        this.employeesByRoleList = employees;
        this.fetchingEmployees = false;
      },
      error: () => this.fetchingEmployees = false
    });
  }

  toggleEmployeeSelection(id: number) {
    const index = this.selectedEmployeeIds.indexOf(id);
    if (index > -1) {
      this.selectedEmployeeIds.splice(index, 1);
    } else {
      this.selectedEmployeeIds.push(id);
    }
  }

  assignEmployees() {
    if (this.selectedEmployeeIds.length === 0 || !this.currentTeam) return;
    this.isSubmitting = true;
    
    const selectedRole = this.rolesList.find(r => r.name === this.selectedRoleName);
    if (!selectedRole) {
      this.isSubmitting = false;
      return;
    }

    if (this.currentLevel === 'SENIOR') {
      const juniorPayload = {
        seniorCounsellorId: this.currentTeam.leader.id,
        juniorCounsellorIds: this.selectedEmployeeIds
      };

      this.hierarchyService.assignJuniorCounsellors(juniorPayload).subscribe({
        next: () => {
          this.notificationService.success('Junior counsellors assigned successfully!');
          this.isSubmitting = false;
          this.closeAssignModal();
          this.handlePostAssignmentActions();
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Failed to assign junior counsellors.';
          this.notificationService.error(errorMsg);
          this.isSubmitting = false;
        }
      });
    } else {
      const payload = {
        roleId: selectedRole.id,
        managerId: this.currentTeam.leader.id,
        userIds: this.selectedEmployeeIds
      };

      this.hierarchyService.assignEmployees(payload).subscribe({
        next: () => {
          this.notificationService.success('Employees assigned successfully!');
          this.isSubmitting = false;
          this.closeAssignModal();
          this.handlePostAssignmentActions();
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Failed to assign employees.';
          this.notificationService.error(errorMsg);
          this.isSubmitting = false;
        }
      });
    }
  }

  openUnassignModal(member: any) {
    if (this.isSenior(member)) {
      const subTeam = this.getSubTeam(member);
      const reports = subTeam?.members || subTeam?.employees || [];
      if (reports.length > 0) {
        this.notificationService.error('Cannot remove a Senior Counsellor who has mapped Junior Counsellors. Please unassign the Junior Counsellors first.');
        return;
      }
    }
    this.memberToUnassign = member;
    this.showUnassignModal = true;
  }

  cancelUnassign() {
    this.showUnassignModal = false;
    this.memberToUnassign = null;
  }

  executeUnassign() {
    if (!this.memberToUnassign) return;
    this.isUnassigning = true;
    
    const obs = this.isJunior(this.memberToUnassign)
      ? this.hierarchyService.unassignJuniorCounsellor(this.memberToUnassign.id)
      : this.hierarchyService.unassignEmployee(this.memberToUnassign.id);

    obs.subscribe({
      next: () => {
        this.notificationService.success('Member unassigned');
        this.isUnassigning = false;
        this.cancelUnassign();
        this.handlePostAssignmentActions();
      },
      error: () => {
        this.notificationService.error('Failed to unassign member');
        this.isUnassigning = false;
      }
    });
  }

  // --- Add Manager Logic ---
  openAddManagerModal() {
    this.newManager = { name: '', email: '', phone: '', branchId: '' as unknown as number, roleId: '' as unknown as number };
    this.showAddManagerModal = true;
    
    // Ensure managerRoles are loaded
    if (this.managerRoles.length === 0) {
        this.roleService.getAllRoles().subscribe({
            next: (roles) => {
                this.managerRoles = roles.filter(r => r.name.toUpperCase().includes('MANAGER') || r.name.toUpperCase() === 'ADMIN');
                const defaultRole = this.managerRoles.find(r => r.name.toUpperCase() === 'MANAGER');
                if (defaultRole) {
                    this.newManager.roleId = defaultRole.id;
                }
            }
        });
    } else {
        const defaultRole = this.managerRoles.find(r => r.name.toUpperCase() === 'MANAGER');
        if (defaultRole) {
            this.newManager.roleId = defaultRole.id;
        }
    }
  }

  closeAddManagerModal() {
    if (this.submittingManager) return;
    this.showAddManagerModal = false;
  }

  onSubmitManager() {
    if (!this.newManager.name || !this.newManager.email || !this.newManager.branchId || !this.newManager.roleId) return;

    this.submittingManager = true;
    this.employeeService.createEmployee(this.newManager).subscribe({
      next: () => {
        this.notificationService.success('Manager added successfully!');
        this.submittingManager = false;
        this.showAddManagerModal = false;
        this.handlePostAssignmentActions();
      },
      error: (err) => {
        console.error('Failed to create manager', err);
        const errorMsg = err.error?.message || 'Failed to add manager. Please try again.';
        this.notificationService.error(errorMsg);
        this.submittingManager = false;
      }
    });
  }

  private handlePostAssignmentActions() {
    this.isLoading = true;
    this.loadHierarchy();
    this.loadAllEmployees();
    this.cancelSidebarAssignment();
  }

  formatRole(role: string): string {
    if (!role) return '';
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}
