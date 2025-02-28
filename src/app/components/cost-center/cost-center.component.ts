import { Component, inject, OnInit, signal } from '@angular/core';
import { CostCenter } from './model/cost-center.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CostCenterService } from '../../services/cost-center.service';

@Component({
  selector: 'app-cost-center',
  imports: [CommonModule, FormsModule],
  templateUrl: './cost-center.component.html',
  styleUrl: './cost-center.component.css',
})
export class CostCenterComponent implements OnInit {
  ccService = inject(CostCenterService);

  costCenters = signal<CostCenter[]>([]);
  showCCModal = signal<boolean>(false);
  costCenter: CostCenter = new CostCenter();

  addCost() {
    this.costCenter = new CostCenter();
    this.showCCModal.set(true);
  }

  closeModal(event: Event) {
    const g = event as PointerEvent;
    if (g.pointerType == 'mouse') {
      this.showCCModal.set(false);
    }
  }

  deleteCC(cc: CostCenter) {
    this.ccService.deleteCC(cc).subscribe((res) => {
      console.log(res);
      this.getCC();
      this.showCCModal.set(false);
    });
  }

  editCostCenter(cc: CostCenter) {
    this.costCenter = cc;
    this.showCCModal.set(true);
  }

  getCC() {
    this.ccService.getCC().subscribe((res) => this.costCenters.set(res));
  }

  saveCC() {
    this.ccService.createCC(this.costCenter).subscribe((res) => {
      console.log(res);
      this.getCC();
      this.showCCModal.set(false);
    });
  }

  updateCC(cc: CostCenter) {
    this.ccService.updateCC(cc).subscribe((res) => {
      this.getCC();
      this.showCCModal.set(false);
    });
  }

  ngOnInit(): void {
    this.getCC();
  }
}
