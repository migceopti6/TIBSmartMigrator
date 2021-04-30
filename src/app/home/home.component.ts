import { Component } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '../_models';
import { UserService, AuthenticationService } from '../_services';
import { NgxSpinnerService } from 'ngx-spinner';
import * as xml2js from 'xml2js';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';

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
    expandedRows:Array<Number> =[];
    profileName:string ="default";
    isActive:string = "";
    analyzerPath:string=null;
    migratorPath:string=null;
    generatePath:string=null;
    selectedAnalyzerFile:File;
    selectedMigratorFile:File;
    selectedGeneratorFile:File;
    analyzerReportPath:string;
    reportLocation:any;
    public ANALYZER_URL = 'http://localhost:19093';
    public GENERATOR_URL = 'http://localhost:19092';
    public MIGRATOR_URL = 'http://localhost:19091';
    public FILE_UPLOAD_PATH = "C:/TibSmartMigrator/migration/upload/";
    public FILE_UPLOAD_URL = "http://localhost:3001/upload";
    public FILE_DOWNLOAD_URL = "http://localhost:3001/download/"
    constructor(private userService: UserService,public spinnerService: NgxSpinnerService,private authenticationService: AuthenticationService, public router:Router,public http: HttpClient) {}

    ngOnInit() {
        this.userService.getAll().pipe(first()).subscribe(users => {
            this.users = users;
        });
        this.spinnerService.hide();
    }
 
  expandRow(index: number,value:string): void {
    if(value == 'false'){
      if(!this.expandedRows.includes(index)) {
        let i = index;
        this.expandedRows.push(i);
      }else{
        const value: number = this.expandedRows.indexOf(index);
        this.expandedRows.splice(value,1);
      }
      console.log(this.expandedRows);
    }
  }

  checkExpanded(index){
      console.log("Array contains index "+index+" value : "+this.expandedRows.includes(index));
      return this.expandedRows.includes(index);
  }

  getFile(event: any){       
    this.analyzerPath = event.target.files[0].name;
    this.selectedAnalyzerFile =  event.target.files[0];
  }

  getMigrateFile(event: any){         
    this.migratorPath = event.target.files[0].name;
    this.selectedMigratorFile = event.target.files[0];
  }

  getGenerateFile(event: any){        
    this.generatePath = event.target.files[0].name;
    this.selectedGeneratorFile = event.target.files[0];
  }

  download(downloadFilePath){
    var filePath = downloadFilePath.replace(/\//g, '|');
    this.http
        .get(this.FILE_DOWNLOAD_URL + filePath, { responseType: "blob" }) //set response Type properly (it is not part of headers)
        .toPromise()
        .then(blob => {
            console.log(filePath[filePath.length -1]);
            var fileArray = filePath.split('|');
            var fileName = fileArray[fileArray.length -1];
            saveAs(blob, fileName); 
        })
        .catch(err => console.error("download error = ", err))
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
        this.generatePath = null;
      }else{
        this.showAnalyzer = true;
        this.showMigrator = false;
        this.showGenerator = false;
        this.showAnalyzerData = false;
        this.showGeneratorData = false;
        this.showMigratorData = false;
        this.analyzerPath = null;
      }
  }
  
  chngRadiobtn(){
    this.isActive = (!!this.isActive) ? "" : "rvToEms";
  }
    
  getFilename(reportLocation):string{
    if(!!reportLocation){
      var filePath = reportLocation.replace(/\//g, '|');
      var fileArray = filePath.split('|');
      var reportName = fileArray[fileArray.length -1];
      return reportName;
    }else{
      return null;
    }
  }

    analyze(analyzeData) {
        this.spinnerService.show();
        const uploadData = new FormData();
        uploadData.append('file', this.selectedAnalyzerFile);
        this.http.post(this.FILE_UPLOAD_URL, uploadData)
          .subscribe(
            (res) => {
              console.log(res);
                // Send Http request
                let body = new HttpParams();
                // body = body.set('codebaseLocation_FormA', analyzeData.codebaseLocation_FormA);
                body = body.set('codebaseLocation_FormA', this.FILE_UPLOAD_PATH+this.analyzerPath);
                body = body.set('bwCompatibility', analyzeData.bwCompatibility);
                
                this.http.post(this.ANALYZER_URL,body,{ responseType: 'text' })
                  .subscribe({
                    next: responseData => {
                      console.log(responseData);
                        // this.analyzerPathLocation = analyzeData.codebaseLocation_FormA;
                        // this.analyzerCompatibility = analyzeData.bwCompatibility;
                      
                        const parser = new xml2js.Parser({ strict: false, trim: true });
                        xml2js.parseString(responseData, {trim: true}, (err, result) => {
                          if(err){
                            console.log(err);
                            Swal.fire('Failure!', "Response format error." , 'error');
                            this.spinnerService.hide();
                          }else{
                            console.log(result);
                            this.migratorPath = this.analyzerPath;
                            if(!!result && !!result.response && !!result.response.Rows && !!result.response.Rows[0]){
                              this.reportLocation = result.response.location[0];
                              this.analyzerReportPath = this.getFilename(this.reportLocation);
                              console.log(result.response.Rows[0].root); 
                              console.log(result.response.Rows[0].root[0].ActivityGroup[0]); 
                              console.log(result.response.Rows[0].root[0].ActivityName[0]); 
                              console.log(result.response.Rows[0].root[0].Count[0]); 
                              console.log(result.response.Rows[0].root[0].Compatibility[0]); 
                              console.log(result.response.Rows[0].root[0].SuggestedActivity[0]); 
                              this.values = result.response.Rows[0].root;
                              this.showAnalyzerData = true;
                              setTimeout(() => {
                                window.scrollTo(0, 1500);
                              }, 10)
                              this.spinnerService.hide();
                            }else{
                              this.showAnalyzerData = false;
                              this.migratorPath = null;
                              this.spinnerService.hide();
                              Swal.fire('Failure!', result , 'error');
                            }
                          }
                        });
                      },
                      error: error => {
                        this.spinnerService.hide();
                        Swal.fire('Failure!', "Response format error." , 'error');
                        this.showAnalyzerData = false;
                        console.log(error.message);
                      }        
                  });
            },
            (err) => {
              console.log(err);
              Swal.fire('Failure!', "File upload failed." , 'error');
              this.showAnalyzerData = false;
              this.spinnerService.hide();
            }
          );
    }

    migrate(migrateForm:any){
      this.spinnerService.show();
      let httpHeaders = new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded');
      let body = new HttpParams();
      body = body.set('codebaseLocation_FormA', this.FILE_UPLOAD_PATH+this.migratorPath);
      body = body.set('bwMigration',migrateForm.bwMigration);
      body = body.set('rvMigration', migrateForm.rvMigration);
      body = body.set('codeCleanUp',migrateForm.codeCleanUp);
      body = body.set('ndProcess', (!!migrateForm.ndProcess ? migrateForm.ndProcess : ""));
      body = body.set('ndResource', (!!migrateForm.ndResource ? migrateForm.ndResource : ""));
      body = body.set('ndGV', (!!migrateForm.ndGV ? migrateForm.ndGV : ""));
      body = body.set('ndFolder', (!!migrateForm.ndFolder ? migrateForm.ndFolder : ""));
      body = body.set('folderReorganization', (!!migrateForm.folderReorganization ? 'false' : 'true'));
      if(!!this.selectedMigratorFile){
        const uploadData = new FormData();
        uploadData.append('file', this.selectedMigratorFile);
        this.http.post(this.FILE_UPLOAD_URL, uploadData)
          .subscribe(
            (res) => {
              console.log(res);
              // Send Http request
              this.http.post(this.MIGRATOR_URL,body,{ responseType: 'text' })
                .subscribe({
                  next: responseData => {
                    console.log(responseData);
                    const parser = new xml2js.Parser({ strict: false, trim: true });
                    xml2js.parseString(responseData, {trim: true}, (err, result) => {
                      if(err){
                        console.log(err);
                        Swal.fire('Failure!', responseData , 'error');
                        this.spinnerService.hide();
                      } else{
                        console.log(result);
                        this.values = result;
                        this.showMigratorData = true;
                        setTimeout(() => {
                          window.scrollTo(0, 1500);
                        }, 10)
                        this.spinnerService.hide();
                      }
                    });
                  },
                  error: error => {
                    this.spinnerService.hide();
                    Swal.fire('Failure!', "Response format error." , 'error');
                    this.showMigratorData = false;
                    console.log(error.message);
                  }        
                });
            },
            (err) => {
              console.log(err);
              Swal.fire('Failure!', "File upload failed." , 'error');
              this.showMigratorData = false;
              this.spinnerService.hide();
            }
          );
      }else{
         // Send Http request
         this.http.post(this.MIGRATOR_URL,body,{ responseType: 'text' })
         .subscribe({
           next: responseData => {
             console.log(responseData);
             const parser = new xml2js.Parser({ strict: false, trim: true });
             xml2js.parseString(responseData, {trim: true}, (err, result) => {
               if(err){
                 console.log(err);
                 Swal.fire('Failure!', responseData , 'error');
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
             Swal.fire('Failure!', "Response format error." , 'error');
             this.showMigratorData = false;
             console.log(error.message);
           }        
         });
      }
      
    }
  
    generate(generateForm) {
        this.spinnerService.show();
        const uploadData = new FormData();
        uploadData.append('file', this.selectedGeneratorFile);
          // Swal.fire('Success!', "File uploaded successfully" , 'success');
        this.http.post(this.FILE_UPLOAD_URL, uploadData)
          .subscribe(
            (res) => {
              console.log(res);
              // Send Http request
              let body = new HttpParams();
              body = body.set('codebaseLocation_FormA',  this.FILE_UPLOAD_PATH+this.generatePath);
              body = body.set('profileName', generateForm.profileName);
              body = body.set('bwArtifact', generateForm.bwArtifact);

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
                        Swal.fire('Failure!', responseData , 'error');
                        this.spinnerService.hide();
                      } else{
                        console.log(result);
                        this.values = result;
                        this.showGeneratorData = true;
                        setTimeout(() => {
                          window.scrollTo(0, 1500);
                        }, 10)
                        this.spinnerService.hide();
                      }
                    });
                  },
                  error: error => {
                    this.spinnerService.hide();
                    Swal.fire('Failure!', "Response format error." , 'error');
                    this.showGeneratorData = false;
                    console.log(error.message);
                  }        
                });
            },
            (err) => {
              console.log(err);
              Swal.fire('Failure!', "File upload failed." , 'error');
              this.showGeneratorData = false;
              this.spinnerService.hide();
            }
          );
    }

    logout(){
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    }
}