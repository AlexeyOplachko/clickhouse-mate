import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { emitWindowResize } from '@app/helper/windowFunctions';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { AgEventService } from './ag-event.service';

@Component({
    selector: 'app-setting-button',
    templateUrl: 'setting-button.html',
    styleUrls: ['setting-button.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingButtonComponent implements ICellRendererAngularComp {
    public params: any;
    callid: string | null= null;
    isFilterOpened: boolean = false;
    allColumnIds: any[] = [];
    apiColumn: any;
    headerName = '';

    menuList: any;

    @Input() isTab = false;
    constructor(
        private cdr: ChangeDetectorRef,
        private agEventService: AgEventService
    ) { }

    agInit(params: any): void {
        this.params = params;
        this.callid = this.params.value || null;
        this.headerName = this.params.displayName || '';
        this.apiColumn = this.params.columnApi;

        this.menuList = this.agEventService.itemList;

        Object.values(this.params.columnApi.getAllGridColumns() as Object)
            .filter((column) => !['', 'id'].includes(column.colDef.field))
            .forEach((column, index) => this.allColumnIds.push({
                name: column.colDef.headerName || column.colDef.field,
                field: column.colDef.field,
                selected: column.visible,
                idx: index
            }));
        this.cdr.detectChanges();
    }

    menuClick(item: any) {
        this.agEventService.emit(item);
    }
    refresh(): boolean {
        return false;
    }
    hideFilter() {
        this.isFilterOpened = false;
        this.cdr.detectChanges();
    }
    onUpdateList({ event: { container } }: any) {
        if (this.apiColumn.getAllColumns()) {
            const activeListView = container.id === 'activeListView' ? container : null;
            const inactiveListView = container.id === 'inactiveListView' ? container : null;
            const columnState = this.apiColumn.getColumnState();
            const setVisible = (fName: string, bool: boolean) => {
                if (columnState.find(({ colId }: any) => colId === fName)?.hide === bool) {
                    this.apiColumn.setColumnVisible(fName, bool);
                }
            };
            inactiveListView?.data.forEach(({ field, selected }: any) => setVisible(field, selected));
            activeListView?.data.forEach(({ field, selected }: any, key: number) => {
                setVisible(field, selected);
                this.apiColumn.moveColumn(field, key + 1);
            });
            setTimeout(() => emitWindowResize(), 100);
        }
    }
    doOpenFilter() {
        if (this.isFilterOpened) {
            return;
        }
        setTimeout(() => {
            this.isFilterOpened = true;
            this.cdr.detectChanges();
        });
        this.cdr.detectChanges();
    }
}
