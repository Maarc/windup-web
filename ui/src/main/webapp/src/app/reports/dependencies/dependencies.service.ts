import {AbstractService} from "../../shared/abtract.service";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {Constants} from "../../constants";
import {DependenciesReportModel} from "../../generated/tsModels/DependenciesReportModel";
import {GraphJSONToModelService} from "../../services/graph/graph-json-to-model.service";
import {Cached} from "../../shared/cache.service";

@Injectable()
export class DependenciesService extends AbstractService {
    private GET_DEPENDENCIES_URL = Constants.GRAPH_REST_BASE +  '/graph/{executionId}/dependencies';

    constructor (private _http: Http, private _graphJsonToModelService: GraphJSONToModelService<any>) {
        super();
    }

    /**
     * Returns the DependenciesReportModel
     */
    @Cached('dependencies', null, true)
    getDepsReportModel(executionId: number): Observable<DependenciesReportModel[]> {
        let service = this._graphJsonToModelService;
        let url = `${Constants.GRAPH_REST_BASE}/graph/${executionId}/by-type/` + DependenciesReportModel.discriminator + "?depth=2";
        return this._http.get(url)
            .map((res:Response) => res.json())
            .map((data: any) => {
                if (!Array.isArray(data) || data.length == 0) {
                    throw new Error("No items returned, URL: " + url);
                }
                return <DependenciesReportModel[]>service.fromJSONarray(data, DependenciesReportModel);
            })
            .catch(this.handleError);
    }

    @Cached('dependencies', null, true)
    public getDependencies(executionId: number): Observable<any> {
        let url = this.GET_DEPENDENCIES_URL.replace('{executionId}', executionId.toString());

        return this._http.get(url)
            .map(res => res.json())
            .catch(this.handleError);
    }
}

export interface DependencyNode {
    id: number;
    name: string;
    data: any;
}

export interface DependencyEdge {
    from: number;
    to: number;
}

export interface DependenciesData {
    nodes: DependencyNode[];
    edges: DependencyEdge[];
}

