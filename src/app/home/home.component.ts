import { Component } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '../_models';
import { UserService, AuthenticationService } from '../_services';
import { NgxSpinnerService } from 'ngx-spinner';
import * as xml2js from 'xml2js';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
  })
  
export class HomeComponent {
    users: User[];
    showAnalyzer:boolean = true;
    showMigrator:boolean = false;
    showGenerator:boolean = false;
    public values: any;
    showAnalyzerData:boolean = false;
    showGeneratorData:boolean = false;
    showMigratorData:boolean = false;
  
    analyzerPathLocation:string ="";
    analyzerCompatibility:string ="";
    showIndex:number = 0;
    public expandedIndex:number;
    isExpanded:boolean = true;
    profileName:string ="default";
    isActive:string = "";
    public URLG = 'http://54.85.113.141:8181/integration-framework-0.0.1-SNAPSHOT/api/v1/deploymentDetails';
    public ANALYZER_URL = 'http://localhost:19093';
    public GENERATOR_URL = 'http://localhost:19092';
    public MIGRATOR_URL = 'http://localhost:19091';

    constructor(private userService: UserService,public spinnerService: NgxSpinnerService,private authenticationService: AuthenticationService, public router:Router,public http: HttpClient) { this.expandedIndex=-1; }

    ngOnInit() {
        this.userService.getAll().pipe(first()).subscribe(users => {
            this.users = users;
        });
        this.spinnerService.hide();
    }
    expandRow(index: number,value:string): void {
        if(value == 'false'){
           this.expandedIndex = index === this.expandedIndex ? -1 : index;
           this.isExpanded = !!this.expandedIndex;
        }
      }
      goToTab(value:string){
          if(value == '2'){
            this.showAnalyzer = false;
            this.showMigrator = true;
            this.showGenerator = false;
            this.showAnalyzerData = false;
            this.showMigratorData = false;
            this.showGeneratorData = false;
          }else if(value == '3'){
            this.showAnalyzer = false;
            this.showMigrator = false;
            this.showGenerator = true;
            this.showAnalyzerData = false;
            this.showGeneratorData = false;
            this.showMigratorData = false;
          }else{
            this.showAnalyzer = true;
            this.showMigrator = false;
            this.showGenerator = false;
            this.showAnalyzerData = false;
            this.showGeneratorData = false;
            this.showMigratorData = false;
          }
      }
    
      chngRadiobtn(){
        this.isActive = (!!this.isActive) ? "" : "rvToEms";
      }
      
    analyze(analyzeData: { 
      codebaseLocation_FormA: string; 
      bwCompatibility: string;}) {
        this.spinnerService.show();
      // Send Http request
      let httpHeaders = new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded');
          let body = new HttpParams();
          body = body.set('codebaseLocation_FormA', analyzeData.codebaseLocation_FormA);
          body = body.set('bwCompatibility', analyzeData.bwCompatibility);
      let options = {
          headers: httpHeaders
      }; 
      this.http.post(this.ANALYZER_URL,body,{ responseType: 'text' })
        .subscribe({
          next: responseData => {
            console.log(responseData);
            this.analyzerPathLocation = analyzeData.codebaseLocation_FormA;
            this.analyzerCompatibility = analyzeData.bwCompatibility;
          
            const parser = new xml2js.Parser({ strict: false, trim: true });
            xml2js.parseString(responseData, {trim: true}, (err, result) => {
              if(err){
                console.log(err);
                this.spinnerService.hide();
              }else{
                console.log(result);
                if(!!result && !!result.response && !!result.response.Rows && !!result.response.Rows[0]){
                  console.log(result.response.Rows[0].root); 
                  console.log(result.response.Rows[0].root[0].ActivityGroup[0]); 
                  console.log(result.response.Rows[0].root[0].ActivityName[0]); 
                  console.log(result.response.Rows[0].root[0].Count[0]); 
                  console.log(result.response.Rows[0].root[0].Compatibility[0]); 
                  console.log(result.response.Rows[0].root[0].SuggestedActivity[0]); 
                  this.values = result.response.Rows[0].root;
                  this.showAnalyzerData = true;
                  this.spinnerService.hide();
                }else{
                  this.showAnalyzerData = false;
                  this.spinnerService.hide();
                }
              }
            });
          },
          error: error => {
            this.spinnerService.hide();
            this.showAnalyzerData = false;
            console.log(error.message);
          }        
        });
      // this.spinnerService.show();
      // // Send Http request
      // // this.http.get(this.URLG)
      // //   .subscribe(response => {
      // //     this.values = response;
      // this.values=[
      //   {"id":"123356","projectId":"1234","interfaceName":"New Test Updating ","deploymentStatus":"SUCCESS","deploymentMode":"Docker2222","buildNumber":"1.0","instanceName":"Test2222","costCenter":"Test2222","memoryRequest":"Test2222","cpuRequest":"Test2222","memoryLimit":"Test2222","cpuLimit":"Test2222","healthCheckUri":"Test2222","techOwner":"Test2222"},
      //   {"id":"5fe0d5d548ec052fbeaabf53","projectId":null,"interfaceName":"RESTDEMOAPP45","deploymentStatus":"FAILURE","deploymentMode":null,"buildNumber":"3","instanceName":null,"costCenter":null,"memoryRequest":null,"cpuRequest":null,"memoryLimit":null,"cpuLimit":null,"healthCheckUri":null,"techOwner":null},
      //   {"id":"5fe1c1f948ec052fbeab5336","projectId":null,"interfaceName":"TEST1222","deploymentStatus":"SUCCESS","deploymentMode":null,"buildNumber":"4","instanceName":null,"costCenter":null,"memoryRequest":null,"cpuRequest":null,"memoryLimit":null,"cpuLimit":null,"healthCheckUri":null,"techOwner":null},
      //   {"id":"5fe37fcd11eef6d1877e10fa","projectId":"Inteface New01","interfaceName":"Cts.New.Project","deploymentStatus":"SUCCESS","deploymentMode":"Docker","buildNumber":"1.0","instanceName":"instanceName","costCenter":"costCenter","memoryRequest":"memoryRequest","cpuRequest":"cpuRequest","memoryLimit":"memoryLimit","cpuLimit":"cpuLimit","healthCheckUri":"healthCheckUri","techOwner":"techOwner"},
      //   {"id":"5fe37fd711eef6d1877e10fb","projectId":"Inteface New01","interfaceName":"Cts.New.Project","deploymentStatus":"FAILURE","deploymentMode":"Docker","buildNumber":"1.0","instanceName":"instanceName","costCenter":"costCenter","memoryRequest":"memoryRequest","cpuRequest":"cpuRequest","memoryLimit":"memoryLimit","cpuLimit":"cpuLimit","healthCheckUri":"healthCheckUri","techOwner":"techOwner"}
      //   ];
      //     this.analyzerPathLocation = analyzeData.location;
      //     this.analyzerCompatibility = analyzeData.compatibility;
      //     this.showAnalyzerData = true;
      //     setTimeout(() => {
      //       this.spinnerService.hide();
      //       }, 2000)
      //   // });
      //   const xmlString = `
      //   <?xml version="1.0" encoding="UTF-8"?><response><location>C:\TibSmartMigrator\migration\src\file_migration\File_IntelliReport</location><Rows><root><ActivityName>File Poller</ActivityName><ActivityGroup>File</ActivityGroup><Count>1</Count><Compatibility>true</Compatibility></root><root><ActivityName>Read File</ActivityName><ActivityGroup>File</ActivityGroup><Count>1</Count><Compatibility>true</Compatibility></root><root><ActivityName>Write File</ActivityName><ActivityGroup>File</ActivityGroup><Count>2</Count><Compatibility>true</Compatibility></root><root><ActivityName>Create File</ActivityName><ActivityGroup>File</ActivityGroup><Count>1</Count><Compatibility>true</Compatibility></root><root><ActivityName>Remove File</ActivityName><ActivityGroup>File</ActivityGroup><Count>1</Count><Compatibility>true</Compatibility></root><root><ActivityName>Wait for File Change</ActivityName><ActivityGroup>File</ActivityGroup><Count>1</Count><Compatibility>false</Compatibility></root><root><ActivityName>Call Process</ActivityName><ActivityGroup>General Activities</ActivityGroup><Count>1</Count><Compatibility>true</Compatibility></root><root><ActivityName>Parse XML</ActivityName><ActivityGroup>XML Activities</ActivityGroup><Count>2</Count><Compatibility>true</Compatibility></root></Rows></response>
      //   `;
      //     const parser = new xml2js.Parser({ strict: false, trim: true });
      //     xml2js.parseString(xmlString, {trim: true}, (err, result) => {
      //       if(err) console.log(err);
      //       console.log(result.response.Rows[0].root); 
      //       console.log(result.response.Rows[0].root[0].ActivityGroup[0]); 
      //       console.log(result.response.Rows[0].root[0].ActivityName[0]); 
      //       console.log(result.response.Rows[0].root[0].Count[0]); 
      //       console.log(result.response.Rows[0].root[0].Compatibility[0]); 
  
  
      //       this.values = result.response.Rows[0].root;
      //   });
    }
  
    generate(generateForm:{
      codebaseLocation_FormA: string; 
      profileName: string;
      bwArtifact: string;
    }) {
        this.spinnerService.show();
      // Send Http request
      let httpHeaders = new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded');
          let body = new HttpParams();
          body = body.set('codebaseLocation_FormA', generateForm.codebaseLocation_FormA);
          body = body.set('profileName', generateForm.profileName);
          body = body.set('bwArtifact', generateForm.bwArtifact);
  
      let options = {
          headers: httpHeaders
      }; 
      this.http.post(this.GENERATOR_URL,body,{ responseType: 'text' })
        .subscribe({
          next: responseData => {
            console.log(responseData);
            // this.analyzerPathLocation = generateForm.codebaseLocation_FormA;
            // this.analyzerCompatibility = generateForm.profileName;
            // this.analyzerCompatibility = generateForm.bwArtifact;
            const parser = new xml2js.Parser({ strict: false, trim: true });
            xml2js.parseString(responseData, {trim: true}, (err, result) => {
              if(err){
                console.log(err);
                this.spinnerService.hide();
              } else{
                console.log(result);
                this.values = result;
                this.showGeneratorData = true;
                this.spinnerService.hide();
              }
            });
          },
          error: error => {
            this.spinnerService.hide();
            this.showGeneratorData = false;
            console.log(error.message);
          }        
        });
    }
  
    migrate(migrateForm:any){
        this.spinnerService.show();
      // Send Http request
      let httpHeaders = new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded');
      let body = new HttpParams();
      body = body.set('codebaseLocation_FormA', migrateForm.codebaseLocation_FormA);
      body = body.set('bwMigration',migrateForm.bwMigration);
      body = body.set('rvMigration', "");
      body = body.set('codeCleanUp', migrateForm.codeCleanUp);
      body = body.set('ndProcess', "");
      body = body.set('ndResource', "");
      body = body.set('ndGV', "");
      body = body.set('ndFolder', "");
      body = body.set('folderReorganization', migrateForm.folderReorganization);
  
      this.http.post(this.MIGRATOR_URL,body,{ responseType: 'text' })
        .subscribe({
          next: responseData => {
            console.log(responseData);
            const parser = new xml2js.Parser({ strict: false, trim: true });
            xml2js.parseString(responseData, {trim: true}, (err, result) => {
              if(err){
                console.log(err);
                this.spinnerService.hide();
              } else{
                console.log(result);
                this.values = result;
                this.showMigratorData = true;
                this.spinnerService.hide();
              }
            });
          },
          error: error => {
            this.spinnerService.hide();
            this.showMigratorData = false;
            console.log(error.message);
          }        
        });
    }

    logout(){
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    }
}