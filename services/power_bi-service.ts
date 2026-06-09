import powerbi from "powerbi-client";
export class PowerBIService {
    private powerBI: powerbi.service.Service;
    private embeddedReports: powerbi.Embed[] = [];
    constructor() {
        this.powerBI = new powerbi.service.Service(
            powerbi.factories.hpmFactory,
            powerbi.factories.wpmpFactory,
            powerbi.factories.routerFactory,
        );
    }

    public embedReport(
        element: HTMLElement,
        embedConfig: powerbi.IEmbedConfiguration,
    ): powerbi.Embed {
        const report = this.powerBI.embed(element, embedConfig) as powerbi.Embed;
        this.embeddedReports.push(report);
        return report;
    }

    public reset(element: HTMLElement): void {
        const report = this.powerBI.get(element);
        this.powerBI.reset(element);
        this.embeddedReports = this.embeddedReports.filter(
            (embed) => embed !== report,
        );
    }

    public getReport(element: HTMLElement): powerbi.Embed {
        return this.powerBI.get(element);
    }

    public on(
        element: HTMLElement,
        event: string,
        handler: (event: any) => void,
    ): void {
        const report = this.getReport(element);
        report.on(event, handler);
    }

    public off(
        element: HTMLElement,
        event: string,
        handler: (event: any) => void,
    ): void {
        const report = this.getReport(element);
        report.off(event, handler);
    }

    public getAllReports(): powerbi.Embed[] {
        return [...this.embeddedReports];
    }

    public getVersion(): string {
        return (this.powerBI as any).version;
    }
}
